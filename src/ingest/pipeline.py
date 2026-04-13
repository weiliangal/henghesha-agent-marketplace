"""Step 1-3 ingest pipeline for source media intake and shot manifest generation."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ingest.detector import FixedWindowShotDetector, FfmpegSceneDetector, ShotBoundary
from ingest.errors import IngestPipelineError
from ingest.media_tools import MediaToolError, ToolAvailability, detect_tools, export_thumbnail, extract_audio, probe_video
from ingest.state import transition_shot_status
from ingest.timing import midpoint
from utils.enums import DetectorMode, LogLevel, ShotStatus
from utils.schemas import (
    IngestRunSummary,
    ProjectManifest,
    ShotManifestEntry,
    StatusTransition,
    ToolingSnapshot,
    bootstrap_shot,
)


@dataclass(slots=True)
class IngestPipelineConfig:
    project_id: str
    episode_id: str
    input_video: Path
    manifest_output: Path
    audio_output_dir: Path = Path("data/audio")
    temp_output_dir: Path = Path("data/temp/ingest")
    scene_threshold: float = 0.30
    min_shot_len_sec: float = 0.75
    fixed_window_sec: float = 3.0
    allow_fixed_window_fallback: bool = True


class IngestPipeline:
    """Orchestrates metadata probing, shot detection, and initial manifest creation."""

    def __init__(self, config: IngestPipelineConfig) -> None:
        self.config = config

    def run(self) -> ProjectManifest:
        input_video = self.config.input_video.resolve()
        if not input_video.exists():
            raise IngestPipelineError(f"Input video does not exist: {input_video}")

        tools = detect_tools()
        warnings: list[str] = []
        summary_logs: list[StatusTransition] = []
        detector_mode = DetectorMode.FFMPEG_SCENE if tools.ffmpeg_available else DetectorMode.FIXED_WINDOW

        try:
            source_asset = probe_video(input_video, tools, detector_mode)
        except MediaToolError as exc:
            raise IngestPipelineError(str(exc)) from exc

        shot_boundaries = self._detect_shots(
            input_video=input_video,
            duration_sec=source_asset.duration_sec,
            tools=tools,
            warnings=warnings,
        )
        if shot_boundaries:
            source_asset.detector_mode = shot_boundaries[0].detector_mode

        audio_path = self._extract_source_audio(input_video, tools, warnings)
        shots = self._build_shots(
            input_video=input_video,
            shot_boundaries=shot_boundaries,
            tools=tools,
            shared_audio_path=audio_path,
            warnings=warnings,
        )

        summary_logs.append(
            StatusTransition(
                from_status=None,
                to_status=ShotStatus.INGESTED,
                actor="ingest_pipeline",
                reason=f"Ingest completed for {len(shots)} shots",
                metadata={"episode_id": self.config.episode_id},
            )
        )
        ingest_summary = IngestRunSummary(
            tooling=ToolingSnapshot(
                ffmpeg_available=tools.ffmpeg_available,
                ffprobe_available=tools.ffprobe_available,
                detector_mode=source_asset.detector_mode,
            ),
            warnings=warnings,
            log_entries=summary_logs,
        )

        manifest = ProjectManifest(
            project_id=self.config.project_id,
            episode_id=self.config.episode_id,
            source_asset=source_asset,
            ingest_summary=ingest_summary,
            shots=shots,
        )
        manifest.updated_at_utc = ingest_summary.created_at_utc
        self._write_manifest(manifest)
        return manifest

    def _detect_shots(
        self,
        *,
        input_video: Path,
        duration_sec: float,
        tools: ToolAvailability,
        warnings: list[str],
    ) -> list[ShotBoundary]:
        if tools.ffmpeg_available:
            detector = FfmpegSceneDetector(
                threshold=self.config.scene_threshold,
                min_shot_len_sec=self.config.min_shot_len_sec,
            )
            try:
                detected = detector.detect(input_video, duration_sec=duration_sec, tools=tools)
                if detected:
                    return detected
                warnings.append("No scene cuts detected; using a single full-duration shot")
                return [
                    ShotBoundary(
                        start_sec=0.0,
                        end_sec=round(duration_sec, 3),
                        detector_mode=DetectorMode.FFMPEG_SCENE,
                        confidence=0.5,
                    )
                ]
            except MediaToolError as exc:
                if not self.config.allow_fixed_window_fallback:
                    raise IngestPipelineError(str(exc)) from exc
                warnings.append(f"Scene detection fell back to fixed windows: {exc}")

        if not self.config.allow_fixed_window_fallback:
            raise IngestPipelineError("Shot detection requires ffmpeg when fallback is disabled")

        warnings.append("Using fixed-window fallback detector; shot boundaries need manual review")
        detector = FixedWindowShotDetector(window_sec=self.config.fixed_window_sec)
        return detector.detect(duration_sec=duration_sec)

    def _extract_source_audio(
        self,
        input_video: Path,
        tools: ToolAvailability,
        warnings: list[str],
    ) -> Path | None:
        if not tools.ffmpeg_available:
            warnings.append("ffmpeg unavailable: source audio extraction skipped")
            return None

        audio_path = self.config.audio_output_dir / f"{input_video.stem}.wav"
        try:
            return extract_audio(input_video, audio_path, tools)
        except MediaToolError as exc:
            warnings.append(f"Audio extraction skipped: {exc}")
            return None

    def _build_shots(
        self,
        *,
        input_video: Path,
        shot_boundaries: list[ShotBoundary],
        tools: ToolAvailability,
        shared_audio_path: Path | None,
        warnings: list[str],
    ) -> list[ShotManifestEntry]:
        shots: list[ShotManifestEntry] = []
        thumbnail_dir = self.config.temp_output_dir / self.config.episode_id / "thumbnails"

        for index, boundary in enumerate(shot_boundaries, start=1):
            shot_id = f"{self.config.episode_id}_sh{index:04d}"
            thumbnail_path: Path | None = None
            if tools.ffmpeg_available:
                try:
                    thumbnail_path = export_thumbnail(
                        input_video,
                        thumbnail_dir / f"{shot_id}.jpg",
                        midpoint(boundary.start_sec, boundary.end_sec),
                        tools,
                    )
                except MediaToolError as exc:
                    warnings.append(f"Thumbnail export skipped for {shot_id}: {exc}")

            shot = bootstrap_shot(
                shot_id=shot_id,
                source_video_path=input_video.as_posix(),
                start_sec=boundary.start_sec,
                end_sec=boundary.end_sec,
                source_thumbnail_path=thumbnail_path.as_posix() if thumbnail_path else None,
                source_audio_path=shared_audio_path.as_posix() if shared_audio_path else None,
                detector_confidence=boundary.confidence,
                notes="Auto-generated by ingest; dialogue, classification, and scene metadata pending.",
            )
            if boundary.detector_mode == DetectorMode.FIXED_WINDOW:
                shot.risk_flags.append("SHOT_BOUNDARY_NEEDS_MANUAL_REVIEW")
                transition_shot_status(
                    shot,
                    ShotStatus.INGESTED,
                    actor="ingest_pipeline",
                    reason="Fallback detector used; manual validation required",
                    notes="Fixed-window segmentation is provisional.",
                    metadata={"detector_mode": boundary.detector_mode.value},
                )
                shot.state_history[-1].level = LogLevel.WARNING
            shots.append(shot)
        return shots

    def _write_manifest(self, manifest: ProjectManifest) -> None:
        output_path = self.config.manifest_output
        output_path.parent.mkdir(parents=True, exist_ok=True)
        payload = manifest.model_dump(mode="json")
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
