"""Helpers for converting between seconds and timecode strings."""

from __future__ import annotations

import re

TIMECODE_PATTERN = re.compile(
    r"^(?P<hours>\d{2}):(?P<minutes>[0-5]\d):(?P<seconds>[0-5]\d)\.(?P<millis>\d{3})$"
)


def seconds_to_timecode(seconds: float) -> str:
    """Convert seconds to HH:MM:SS.mmm timecode."""
    if seconds < 0:
        raise ValueError("seconds must be non-negative")

    total_millis = int(round(seconds * 1000))
    hours, remainder = divmod(total_millis, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    whole_seconds, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{whole_seconds:02d}.{millis:03d}"


def timecode_to_seconds(timecode: str) -> float:
    """Convert HH:MM:SS.mmm timecode to seconds."""
    match = TIMECODE_PATTERN.match(timecode)
    if not match:
        raise ValueError(f"Invalid timecode format: {timecode}")

    hours = int(match.group("hours"))
    minutes = int(match.group("minutes"))
    seconds = int(match.group("seconds"))
    millis = int(match.group("millis"))
    return (hours * 3600) + (minutes * 60) + seconds + (millis / 1000.0)
