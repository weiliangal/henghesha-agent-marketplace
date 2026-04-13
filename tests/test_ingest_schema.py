from datetime import UTC, datetime

import pytest

from utils.enums import DetectorMode, ShotStatus
from utils.schemas import (
    IngestRunSummary,
    ProjectManifest,
    SourceAsset,
    ToolingSnapshot,
    bootstrap_shot,
)


def test_bootstrap_shot_transitions_to_ingested() -> None:
    shot = bootstrap_shot(
        shot_id="pilot_sh0001",
        source_video_path="data/source_video/pilot.mp4",
        start_sec=0.0,
        end_sec=2.4,
    )

    assert shot.status == ShotStatus.INGESTED
    assert shot.duration_sec == 2.4
    assert shot.state_history[-1].to_status == ShotStatus.INGESTED


def test_bootstrap_shot_rejects_invalid_timing() -> None:
    with pytest.raises(ValueError):
        bootstrap_shot(
            shot_id="broken_shot",
            source_video_path="data/source_video/pilot.mp4",
            start_sec=4.0,
            end_sec=1.0,
        )


def test_project_manifest_counts_shots() -> None:
    manifest = ProjectManifest(
        project_id="pilot",
        episode_id="ep01",
        source_asset=SourceAsset(
            source_asset_id="ep01",
            source_video_path="data/source_video/pilot.mp4",
            filename="pilot.mp4",
            duration_sec=12.0,
            frame_rate=25.0,
            width=1920,
            height=1080,
            audio_sample_rate=48000,
            detector_mode=DetectorMode.FIXED_WINDOW,
        ),
        ingest_summary=IngestRunSummary(
            created_at_utc=datetime.now(tz=UTC),
            tooling=ToolingSnapshot(
                ffmpeg_available=False,
                ffprobe_available=True,
                detector_mode=DetectorMode.FIXED_WINDOW,
            ),
        ),
        shots=[
            bootstrap_shot(
                shot_id="ep01_sh0001",
                source_video_path="data/source_video/pilot.mp4",
                start_sec=0.0,
                end_sec=3.0,
            )
        ],
    )

    assert manifest.shot_count == 1
