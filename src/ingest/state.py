"""State transition helpers for shot manifests."""

from __future__ import annotations

from typing import Any

from utils.enums import ShotStatus
from utils.schemas import ShotManifestEntry

ALLOWED_TRANSITIONS: dict[ShotStatus, set[ShotStatus]] = {
    ShotStatus.NEW: {ShotStatus.INGESTED, ShotStatus.LOCKED},
    ShotStatus.INGESTED: {ShotStatus.TRANSCRIBED, ShotStatus.CLASSIFIED, ShotStatus.LOCKED},
    ShotStatus.TRANSCRIBED: {ShotStatus.LOCALIZED, ShotStatus.CLASSIFIED, ShotStatus.LOCKED},
    ShotStatus.LOCALIZED: {ShotStatus.CLASSIFIED, ShotStatus.QUEUED_RUNWAY, ShotStatus.LOCKED},
    ShotStatus.CLASSIFIED: {ShotStatus.QUEUED_RUNWAY, ShotStatus.GENERATING, ShotStatus.LOCKED},
    ShotStatus.QUEUED_RUNWAY: {ShotStatus.GENERATING, ShotStatus.REWORK, ShotStatus.LOCKED},
    ShotStatus.GENERATING: {ShotStatus.GENERATED, ShotStatus.REWORK, ShotStatus.LOCKED},
    ShotStatus.GENERATED: {ShotStatus.QC_REVIEW, ShotStatus.REWORK, ShotStatus.LOCKED},
    ShotStatus.QC_REVIEW: {ShotStatus.QC_PASS, ShotStatus.QC_FAIL, ShotStatus.REWORK, ShotStatus.LOCKED},
    ShotStatus.QC_PASS: {ShotStatus.CONFORMED, ShotStatus.EXPORTED, ShotStatus.LOCKED},
    ShotStatus.QC_FAIL: {ShotStatus.REWORK, ShotStatus.LOCKED},
    ShotStatus.REWORK: {ShotStatus.QUEUED_RUNWAY, ShotStatus.GENERATING, ShotStatus.LOCKED},
    ShotStatus.CONFORMED: {ShotStatus.EXPORTED, ShotStatus.LOCKED},
    ShotStatus.EXPORTED: {ShotStatus.LOCKED},
    ShotStatus.LOCKED: {ShotStatus.LOCKED},
}


def can_transition(from_status: ShotStatus, to_status: ShotStatus) -> bool:
    if from_status == to_status:
        return True
    return to_status in ALLOWED_TRANSITIONS.get(from_status, set())


def transition_shot_status(
    shot: ShotManifestEntry,
    to_status: ShotStatus,
    *,
    actor: str,
    reason: str,
    error_code: str | None = None,
    notes: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    if not can_transition(shot.status, to_status):
        raise ValueError(f"invalid transition from {shot.status.value} to {to_status.value}")
    shot.transition(
        to_status,
        actor=actor,
        reason=reason,
        error_code=error_code,
        notes=notes,
        metadata=metadata,
    )
