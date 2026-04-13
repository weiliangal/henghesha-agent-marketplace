"""Pydantic models for manifests, state transitions, and source metadata."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from utils.enums import (
    CameraType,
    DetectorMode,
    EmotionalBeat,
    LogLevel,
    MotionIntensity,
    RunwayPath,
    ShotClass,
    ShotStatus,
)
from utils.timecode import seconds_to_timecode, timecode_to_seconds


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


class SourceAsset(BaseModel):
    """Metadata for the source episode or clip."""

    model_config = ConfigDict(extra="forbid")

    source_asset_id: str
    source_video_path: str
    filename: str
    duration_sec: float = Field(gt=0)
    frame_rate: float | None = Field(default=None, gt=0)
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    audio_sample_rate: int | None = Field(default=None, gt=0)
    detector_mode: DetectorMode
    checksum_sha256: str | None = None


class StatusTransition(BaseModel):
    """Auditable state transition for a shot."""

    model_config = ConfigDict(extra="forbid")

    timestamp_utc: datetime = Field(default_factory=utc_now)
    from_status: ShotStatus | None = None
    to_status: ShotStatus
    actor: str = "system"
    level: LogLevel = LogLevel.INFO
    reason: str
    error_code: str | None = None
    notes: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ToolingSnapshot(BaseModel):
    """Snapshot of local media tool availability captured during ingest."""

    model_config = ConfigDict(extra="forbid")

    ffmpeg_available: bool
    ffprobe_available: bool
    detector_mode: DetectorMode


class IngestRunSummary(BaseModel):
    """Top-level ingest runtime summary."""

    model_config = ConfigDict(extra="forbid")

    run_id: str = Field(default_factory=lambda: f"ingest-{uuid4().hex[:12]}")
    created_at_utc: datetime = Field(default_factory=utc_now)
    tooling: ToolingSnapshot
    warnings: list[str] = Field(default_factory=list)
    log_entries: list[StatusTransition] = Field(default_factory=list)


class ShotManifestEntry(BaseModel):
    """Per-shot manifest record."""

    model_config = ConfigDict(extra="forbid", use_enum_values=False)

    shot_id: str
    source_video_path: str
    source_start_tc: str
    source_end_tc: str
    source_start_sec: float = Field(ge=0)
    source_end_sec: float = Field(gt=0)
    duration_sec: float = Field(gt=0)
    transcript_zh: str = ""
    dialogue_present: bool = False
    character_count: int = Field(default=0, ge=0)
    faces_visible: int = Field(default=0, ge=0)
    motion_intensity: MotionIntensity = MotionIntensity.UNKNOWN
    camera_type: CameraType = CameraType.UNKNOWN
    scene_location: str = "unknown"
    emotional_beat: EmotionalBeat = EmotionalBeat.UNKNOWN
    shot_class: ShotClass = ShotClass.UNCLASSIFIED
    recommended_runway_path: RunwayPath = RunwayPath.PENDING_CLASSIFICATION
    fallback_path: RunwayPath = RunwayPath.MANUAL_REVIEW
    status: ShotStatus = ShotStatus.NEW
    source_thumbnail_path: str | None = None
    source_audio_path: str | None = None
    detector_confidence: float | None = Field(default=None, ge=0, le=1)
    risk_flags: list[str] = Field(default_factory=list)
    manual_notes: str | None = None
    state_history: list[StatusTransition] = Field(default_factory=list)
    created_at_utc: datetime = Field(default_factory=utc_now)
    updated_at_utc: datetime = Field(default_factory=utc_now)

    @field_validator("source_start_tc", "source_end_tc")
    @classmethod
    def validate_timecode(cls, value: str) -> str:
        timecode_to_seconds(value)
        return value

    @model_validator(mode="after")
    def validate_timing(self) -> "ShotManifestEntry":
        if self.source_end_sec <= self.source_start_sec:
            raise ValueError("source_end_sec must be greater than source_start_sec")

        expected_duration = round(self.source_end_sec - self.source_start_sec, 3)
        if abs(expected_duration - self.duration_sec) > 0.02:
            raise ValueError("duration_sec must match the source time range")

        if timecode_to_seconds(self.source_start_tc) > timecode_to_seconds(self.source_end_tc):
            raise ValueError("source_end_tc must be after source_start_tc")
        return self

    def transition(
        self,
        new_status: ShotStatus,
        *,
        actor: str,
        reason: str,
        error_code: str | None = None,
        notes: str | None = None,
        metadata: dict[str, Any] | None = None,
        level: LogLevel = LogLevel.INFO,
    ) -> None:
        """Append a status transition in-place and update the current shot state."""
        transition = StatusTransition(
            from_status=self.status,
            to_status=new_status,
            actor=actor,
            reason=reason,
            error_code=error_code,
            notes=notes,
            metadata=metadata or {},
            level=level,
        )
        self.status = new_status
        self.updated_at_utc = transition.timestamp_utc
        self.state_history.append(transition)


class ProjectManifest(BaseModel):
    """Top-level manifest for a source asset ingest run."""

    model_config = ConfigDict(extra="forbid")

    manifest_id: str = Field(default_factory=lambda: f"manifest-{uuid4().hex[:12]}")
    project_id: str
    episode_id: str
    pipeline_version: str = "0.1.0"
    created_at_utc: datetime = Field(default_factory=utc_now)
    updated_at_utc: datetime = Field(default_factory=utc_now)
    source_asset: SourceAsset
    ingest_summary: IngestRunSummary
    shots: list[ShotManifestEntry]

    @property
    def shot_count(self) -> int:
        return len(self.shots)

    @model_validator(mode="after")
    def validate_shots(self) -> "ProjectManifest":
        if not self.shots:
            raise ValueError("manifest must contain at least one shot")
        return self


def bootstrap_shot(
    *,
    shot_id: str,
    source_video_path: str,
    start_sec: float,
    end_sec: float,
    source_thumbnail_path: str | None = None,
    source_audio_path: str | None = None,
    detector_confidence: float | None = None,
    notes: str | None = None,
) -> ShotManifestEntry:
    """Create a shot record with the initial NEW -> INGESTED transition."""
    shot = ShotManifestEntry(
        shot_id=shot_id,
        source_video_path=source_video_path,
        source_start_tc=seconds_to_timecode(start_sec),
        source_end_tc=seconds_to_timecode(end_sec),
        source_start_sec=round(start_sec, 3),
        source_end_sec=round(end_sec, 3),
        duration_sec=round(end_sec - start_sec, 3),
        source_thumbnail_path=source_thumbnail_path,
        source_audio_path=source_audio_path,
        detector_confidence=detector_confidence,
        manual_notes=notes,
        status=ShotStatus.NEW,
    )
    shot.transition(
        ShotStatus.INGESTED,
        actor="ingest_pipeline",
        reason="Initial ingest manifest created",
    )
    return shot
