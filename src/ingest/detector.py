"""Shot-boundary detection helpers for ingest."""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

from ingest.media_tools import MediaToolError, ToolAvailability
from utils.enums import DetectorMode

SCENE_PTS_PATTERN = re.compile(r"pts_time:(?P<time>\d+(?:\.\d+)?)")


@dataclass(slots=True)
class ShotBoundary:
    """Time range returned by the detector."""

    start_sec: float
    end_sec: float
    detector_mode: DetectorMode
    confidence: float | None = None

    @property
    def duration_sec(self) -> float:
        return round(self.end_sec - self.start_sec, 3)


class FfmpegSceneDetector:
    """Scene-change detector backed by ffmpeg's scene score filter."""

    def __init__(self, threshold: float = 0.30, min_shot_len_sec: float = 0.75) -> None:
        self.threshold = threshold
        self.min_shot_len_sec = min_shot_len_sec

    def detect(
        self,
        input_video: Path,
        *,
        duration_sec: float,
        tools: ToolAvailability,
    ) -> list[ShotBoundary]:
        if not tools.ffmpeg_available or not tools.ffmpeg_path:
            raise MediaToolError("ffmpeg is required for scene-based shot detection")

        command = [
            tools.ffmpeg_path,
            "-hide_banner",
            "-i",
            str(input_video),
            "-filter:v",
            f"select='gt(scene,{self.threshold})',showinfo",
            "-an",
            "-f",
            "null",
            "-",
        ]
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
        if completed.returncode not in (0, 255):
            stderr = completed.stderr.strip() or completed.stdout.strip()
            raise MediaToolError(f"ffmpeg scene detection failed: {stderr}")

        pts_values = [float(match.group("time")) for match in SCENE_PTS_PATTERN.finditer(completed.stderr)]
        return _build_boundaries(
            pts_values,
            duration_sec=duration_sec,
            detector_mode=DetectorMode.FFMPEG_SCENE,
            min_shot_len_sec=self.min_shot_len_sec,
            confidence=0.8,
        )


class FixedWindowShotDetector:
    """Fallback detector that chunks a clip into fixed windows."""

    def __init__(self, window_sec: float = 3.0) -> None:
        self.window_sec = window_sec

    def detect(self, *, duration_sec: float) -> list[ShotBoundary]:
        time_cursor = 0.0
        boundaries: list[ShotBoundary] = []
        while time_cursor < duration_sec:
            end_sec = min(duration_sec, time_cursor + self.window_sec)
            boundaries.append(
                ShotBoundary(
                    start_sec=round(time_cursor, 3),
                    end_sec=round(end_sec, 3),
                    detector_mode=DetectorMode.FIXED_WINDOW,
                    confidence=0.25,
                )
            )
            time_cursor = end_sec
        return boundaries


def _build_boundaries(
    candidate_cut_points: list[float],
    *,
    duration_sec: float,
    detector_mode: DetectorMode,
    min_shot_len_sec: float,
    confidence: float | None,
) -> list[ShotBoundary]:
    if duration_sec <= 0:
        raise ValueError("duration_sec must be positive")

    filtered_points = [0.0]
    for cut_point in sorted({round(point, 3) for point in candidate_cut_points if 0.0 < point < duration_sec}):
        if cut_point - filtered_points[-1] >= min_shot_len_sec:
            filtered_points.append(cut_point)

    if duration_sec - filtered_points[-1] < min_shot_len_sec and len(filtered_points) > 1:
        filtered_points.pop()
    filtered_points.append(round(duration_sec, 3))

    boundaries: list[ShotBoundary] = []
    for start_sec, end_sec in zip(filtered_points, filtered_points[1:], strict=True):
        boundaries.append(
            ShotBoundary(
                start_sec=round(start_sec, 3),
                end_sec=round(end_sec, 3),
                detector_mode=detector_mode,
                confidence=confidence,
            )
        )

    if not boundaries:
        boundaries.append(
            ShotBoundary(
                start_sec=0.0,
                end_sec=round(duration_sec, 3),
                detector_mode=detector_mode,
                confidence=confidence,
            )
        )
    return boundaries
