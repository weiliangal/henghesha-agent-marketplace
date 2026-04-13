# AGENTS.md

This repository is organized as a shot-level remaster pipeline for localized short drama production.

## Operating Rules

- Do not treat the system as an episode-level one-click generator.
- Do not make face swap the primary path.
- Do not bypass the manifest contract.
- Do not skip human review before final export.
- Do not let a shot enter downstream stages without a recorded state transition.

## Shared Data Contract

Every shot should eventually carry:

- `shot_id`
- `source_start_tc`
- `source_end_tc`
- `duration_sec`
- `transcript_zh`
- `dialogue_present`
- `character_count`
- `faces_visible`
- `motion_intensity`
- `camera_type`
- `scene_location`
- `emotional_beat`
- `shot_class`
- `recommended_runway_path`
- `fallback_path`
- `status`

## State Machine

Expected shot states:

- `NEW`
- `INGESTED`
- `TRANSCRIBED`
- `LOCALIZED`
- `CLASSIFIED`
- `QUEUED_RUNWAY`
- `GENERATING`
- `GENERATED`
- `QC_REVIEW`
- `QC_PASS`
- `QC_FAIL`
- `REWORK`
- `LOCKED`
- `CONFORMED`
- `EXPORTED`

State transitions must be logged with:

- timestamp
- old state
- new state
- actor
- reason
- error code, if any

## Ownership Boundaries

- `src/ingest` is reserved for ingest logic.
- `src/localize` is reserved for dialogue localization.
- `src/classify` is reserved for shot classification and routing.
- `src/runway` is reserved for remote generation orchestration.
- `src/qc` is reserved for scoring and rejection logic.
- `src/compose` is reserved for timeline conform and export.

## Implementation Expectations

- Prefer small adapters over monolithic scripts.
- Keep request payloads and response metadata for external services.
- Make every long-running action resumable and inspectable.
- Keep generated artifacts and source inputs separate.

## Handoff Notes For Future Contributors

Before editing a module, confirm:

- the manifest schema fields it reads and writes
- the exact state transitions it is allowed to trigger
- which config file owns its defaults
- whether it should fail hard or degrade gracefully when media tools are missing

