"""Compatibility exports for shared pipeline models."""

from __future__ import annotations

from pathlib import Path

from utils.enums import (
    CameraType,
    DetectorMode,
    EmotionalBeat,
    LogLevel as IngestLevel,
    MotionIntensity,
    RunwayPath,
    ShotClass,
    ShotStatus,
)
from utils.schemas import (
    IngestRunSummary,
    ProjectManifest,
    ShotManifestEntry as ShotRecord,
    SourceAsset as MediaProbe,
    StatusTransition as StateTransition,
    ToolingSnapshot,
    bootstrap_shot,
    utc_now,
)


def utc_now_iso() -> str:
    return utc_now().isoformat(timespec="seconds").replace("+00:00", "Z")


def default_project_id(source_video_path: str | Path) -> str:
    stem = Path(source_video_path).stem
    safe = "".join(char if char.isalnum() or char in {"-", "_"} else "-" for char in stem).strip("-")
    return safe or "project"


__all__ = [
    "CameraType",
    "DetectorMode",
    "EmotionalBeat",
    "IngestLevel",
    "IngestRunSummary",
    "MediaProbe",
    "MotionIntensity",
    "ProjectManifest",
    "RunwayPath",
    "ShotClass",
    "ShotRecord",
    "ShotStatus",
    "StateTransition",
    "ToolingSnapshot",
    "bootstrap_shot",
    "default_project_id",
    "utc_now_iso",
]
