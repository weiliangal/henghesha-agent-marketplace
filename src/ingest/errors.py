"""Shared ingest exceptions."""


class IngestError(RuntimeError):
    """Base error for ingest and schema generation failures."""


class DependencyUnavailableError(IngestError):
    """Raised when ffmpeg/ffprobe are not available."""


class MediaExtractionError(IngestError):
    """Raised when audio or thumbnail extraction fails."""


class ShotDetectionError(IngestError):
    """Raised when the shot detector cannot derive boundaries."""


class ManifestValidationError(IngestError):
    """Raised when a manifest fails schema validation."""


class IngestPipelineError(IngestError):
    """Raised when the ingest pipeline cannot complete successfully."""
