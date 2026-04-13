"""Command-line entrypoint for Step 1-3 ingest."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from ingest.errors import IngestPipelineError
from ingest.pipeline import IngestPipeline, IngestPipelineConfig


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Ingest a source short-drama clip and emit a shot-level manifest."
    )
    parser.add_argument("--input", required=True, help="Path to the source episode or clip.")
    parser.add_argument("--project-id", required=True, help="Stable project identifier.")
    parser.add_argument("--episode-id", required=True, help="Stable episode or pilot identifier.")
    parser.add_argument(
        "--manifest-out",
        default=None,
        help="Destination JSON manifest path. Defaults to data/manifests/<episode>.ingest.json",
    )
    parser.add_argument(
        "--audio-dir",
        default="data/audio",
        help="Directory for extracted source audio.",
    )
    parser.add_argument(
        "--temp-dir",
        default="data/temp/ingest",
        help="Directory for ingest thumbnails and working files.",
    )
    parser.add_argument(
        "--scene-threshold",
        type=float,
        default=0.30,
        help="ffmpeg scene-change threshold used by the primary detector.",
    )
    parser.add_argument(
        "--min-shot-len",
        type=float,
        default=0.75,
        help="Minimum allowed shot duration after cut consolidation.",
    )
    parser.add_argument(
        "--fixed-window-sec",
        type=float,
        default=3.0,
        help="Fallback shot duration used when scene detection is unavailable.",
    )
    parser.add_argument(
        "--disable-fixed-window-fallback",
        action="store_true",
        help="Fail instead of using fixed-window fallback when ffmpeg scene detection is unavailable.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    manifest_out = (
        Path(args.manifest_out)
        if args.manifest_out
        else Path("data/manifests") / f"{args.episode_id}.ingest.json"
    )
    config = IngestPipelineConfig(
        project_id=args.project_id,
        episode_id=args.episode_id,
        input_video=Path(args.input),
        manifest_output=manifest_out,
        audio_output_dir=Path(args.audio_dir),
        temp_output_dir=Path(args.temp_dir),
        scene_threshold=args.scene_threshold,
        min_shot_len_sec=args.min_shot_len,
        fixed_window_sec=args.fixed_window_sec,
        allow_fixed_window_fallback=not args.disable_fixed_window_fallback,
    )

    try:
        manifest = IngestPipeline(config).run()
    except IngestPipelineError as exc:
        print(f"[ingest] failed: {exc}", file=sys.stderr)
        return 2

    print(
        f"[ingest] manifest={manifest_out.as_posix()} shots={manifest.shot_count} "
        f"detector={manifest.source_asset.detector_mode}"
    )
    if manifest.ingest_summary.warnings:
        print("[ingest] warnings:")
        for warning in manifest.ingest_summary.warnings:
            print(f"  - {warning}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
