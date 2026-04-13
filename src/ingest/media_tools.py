"""Adapters for probing media, exporting audio, and creating thumbnails."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path

from utils.enums import DetectorMode
from utils.schemas import SourceAsset


class MediaToolError(RuntimeError):
    """Raised when a required media tool is unavailable or fails."""


@dataclass(slots=True)
class ToolAvailability:
    ffmpeg_path: str | None
    ffprobe_path: str | None

    @property
    def ffmpeg_available(self) -> bool:
        return self.ffmpeg_path is not None

    @property
    def ffprobe_available(self) -> bool:
        return self.ffprobe_path is not None


def detect_tools() -> ToolAvailability:
    """Detect ffmpeg and ffprobe in PATH."""
    return ToolAvailability(
        ffmpeg_path=shutil.which("ffmpeg"),
        ffprobe_path=shutil.which("ffprobe"),
    )


def _run(args: list[str]) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        args,
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        stderr = completed.stderr.strip() or completed.stdout.strip()
        raise MediaToolError(f"Command failed ({' '.join(args[:2])}): {stderr}")
    return completed


def sha256_for_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    """Stream a file and return its SHA-256 checksum."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def probe_video(input_video: Path, tools: ToolAvailability, detector_mode: DetectorMode) -> SourceAsset:
    """Probe a source video into a SourceAsset model."""
    if not tools.ffprobe_available or not tools.ffprobe_path:
        raise MediaToolError("ffprobe is required to inspect input media metadata")

    completed = _run(
        [
            tools.ffprobe_path,
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(input_video),
        ]
    )
    payload = json.loads(completed.stdout)
    format_block = payload.get("format", {})
    streams = payload.get("streams", [])

    video_stream = next((stream for stream in streams if stream.get("codec_type") == "video"), None)
    audio_stream = next((stream for stream in streams if stream.get("codec_type") == "audio"), None)
    if not video_stream:
        raise MediaToolError("No video stream found in input asset")

    fps_value = video_stream.get("r_frame_rate", "0/1")
    frame_rate = float(Fraction(fps_value)) if fps_value != "0/0" else None
    duration_sec = float(format_block.get("duration") or video_stream.get("duration") or 0)
    if duration_sec <= 0:
        raise MediaToolError("Unable to determine video duration via ffprobe")

    return SourceAsset(
        source_asset_id=input_video.stem,
        source_video_path=input_video.as_posix(),
        filename=input_video.name,
        duration_sec=round(duration_sec, 3),
        frame_rate=round(frame_rate, 3) if frame_rate else None,
        width=video_stream.get("width"),
        height=video_stream.get("height"),
        audio_sample_rate=int(audio_stream["sample_rate"]) if audio_stream and audio_stream.get("sample_rate") else None,
        detector_mode=detector_mode,
        checksum_sha256=sha256_for_file(input_video),
    )


def extract_audio(input_video: Path, output_audio: Path, tools: ToolAvailability) -> Path:
    """Extract a full-resolution WAV audio file from the source clip."""
    if not tools.ffmpeg_available or not tools.ffmpeg_path:
        raise MediaToolError("ffmpeg is required to extract source audio")

    output_audio.parent.mkdir(parents=True, exist_ok=True)
    _run(
        [
            tools.ffmpeg_path,
            "-y",
            "-i",
            str(input_video),
            "-vn",
            "-ac",
            "2",
            "-ar",
            "48000",
            "-c:a",
            "pcm_s16le",
            str(output_audio),
        ]
    )
    return output_audio


def export_thumbnail(input_video: Path, output_image: Path, timestamp_sec: float, tools: ToolAvailability) -> Path:
    """Export a single JPEG thumbnail for the given timestamp."""
    if not tools.ffmpeg_available or not tools.ffmpeg_path:
        raise MediaToolError("ffmpeg is required to export thumbnails")

    output_image.parent.mkdir(parents=True, exist_ok=True)
    _run(
        [
            tools.ffmpeg_path,
            "-y",
            "-ss",
            f"{timestamp_sec:.3f}",
            "-i",
            str(input_video),
            "-frames:v",
            "1",
            "-q:v",
            "2",
            str(output_image),
        ]
    )
    return output_image
