from ingest.detector import FixedWindowShotDetector


def test_fixed_window_detector_covers_full_duration() -> None:
    boundaries = FixedWindowShotDetector(window_sec=3.0).detect(duration_sec=8.2)

    assert len(boundaries) == 3
    assert boundaries[0].start_sec == 0.0
    assert boundaries[-1].end_sec == 8.2
