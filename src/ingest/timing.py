"""Timing helpers used by ingest."""

from __future__ import annotations

from utils.timecode import seconds_to_timecode, timecode_to_seconds


def midpoint(start_sec: float, end_sec: float) -> float:
    if end_sec <= start_sec:
        raise ValueError("end_sec must be greater than start_sec")
    return start_sec + ((end_sec - start_sec) / 2.0)


def clamp_boundaries(boundaries: list[float], duration_sec: float, min_shot_length_sec: float) -> list[float]:
    cleaned = sorted({round(value, 3) for value in boundaries if 0 < value < duration_sec})
    filtered: list[float] = []
    previous = 0.0
    for boundary in cleaned:
        if boundary - previous >= min_shot_length_sec:
            filtered.append(boundary)
            previous = boundary
    if duration_sec - previous < min_shot_length_sec and filtered:
        filtered.pop()
    return filtered
