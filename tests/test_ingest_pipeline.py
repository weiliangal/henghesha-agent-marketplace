from pathlib import Path

from ingest.detector import ShotBoundary
from ingest.media_tools import ToolAvailability
from ingest.pipeline import IngestPipeline, IngestPipelineConfig
from utils.enums import DetectorMode
from utils.schemas import SourceAsset


def test_pipeline_uses_fixed_window_when_ffmpeg_missing(monkeypatch, tmp_path: Path) -> None:
    source = tmp_path / "source.mp4"
    source.write_bytes(b"fake")

    monkeypatch.setattr("ingest.pipeline.detect_tools", lambda: ToolAvailability(None, "ffprobe"))
    monkeypatch.setattr(
        "ingest.pipeline.probe_video",
        lambda input_video, tools, detector_mode: SourceAsset(
            source_asset_id=input_video.stem,
            source_video_path=input_video.as_posix(),
            filename=input_video.name,
            duration_sec=6.0,
            frame_rate=25.0,
            width=1920,
            height=1080,
            audio_sample_rate=48000,
            detector_mode=detector_mode,
        ),
    )

    manifest_path = tmp_path / "manifest.json"
    config = IngestPipelineConfig(
        project_id="pilot",
        episode_id="ep01",
        input_video=source,
        manifest_output=manifest_path,
        fixed_window_sec=3.0,
    )
    manifest = IngestPipeline(config).run()

    assert manifest.shot_count == 2
    assert manifest.source_asset.detector_mode == DetectorMode.FIXED_WINDOW
    assert manifest.ingest_summary.tooling.ffmpeg_available is False
    assert manifest_path.exists()


def test_pipeline_writes_shot_audio_path_when_ffmpeg_available(monkeypatch, tmp_path: Path) -> None:
    source = tmp_path / "source.mp4"
    source.write_bytes(b"fake")
    extracted_audio = tmp_path / "audio" / "source.wav"

    monkeypatch.setattr("ingest.pipeline.detect_tools", lambda: ToolAvailability("ffmpeg", "ffprobe"))
    monkeypatch.setattr(
        "ingest.pipeline.probe_video",
        lambda input_video, tools, detector_mode: SourceAsset(
            source_asset_id=input_video.stem,
            source_video_path=input_video.as_posix(),
            filename=input_video.name,
            duration_sec=4.0,
            frame_rate=25.0,
            width=1920,
            height=1080,
            audio_sample_rate=48000,
            detector_mode=detector_mode,
        ),
    )
    monkeypatch.setattr(
        "ingest.pipeline.extract_audio",
        lambda input_video, output_audio, tools: extracted_audio,
    )
    monkeypatch.setattr(
        "ingest.pipeline.export_thumbnail",
        lambda input_video, output_image, timestamp, tools: output_image,
    )
    monkeypatch.setattr(
        "ingest.detector.FfmpegSceneDetector.detect",
        lambda self, input_video, **kwargs: [
            ShotBoundary(
                start_sec=0.0,
                end_sec=4.0,
                detector_mode=DetectorMode.FFMPEG_SCENE,
                confidence=0.8,
            )
        ],
    )

    manifest_path = tmp_path / "manifest.json"
    config = IngestPipelineConfig(
        project_id="pilot",
        episode_id="ep01",
        input_video=source,
        manifest_output=manifest_path,
        fixed_window_sec=4.0,
    )
    manifest = IngestPipeline(config).run()

    assert manifest.shots[0].source_audio_path == extracted_audio.as_posix()
    assert manifest.shots[0].source_thumbnail_path is not None
