# UGC Factory Console

Operator console ships a real factory vertical slice with route-by-route progression:

- `/factory/intake`: product brief + platform + influencer lock input with mandatory rights/disclosure assertions
- `/factory/plan`: generated scene breakdown, planner mode (`nulla` vs fallback), and provider handoff summary
- `/factory/run`: run timeline, diagnostics, provider failure visibility, backoff polling, and safe retry-from-plan control
- `/factory/review`: human approval/rejection gate with explicit publish blocked/unblocked state
- `/factory/export`: provenance, provider manifest/provenance payloads, and export bundle visibility

## Backend wiring

Typed control-plane client calls:

- `POST /api/factory/plans`
- `GET /api/factory/plans/{plan_id}`
- `POST /api/factory/runs`
- `GET /api/factory/runs/{run_id}`
- `POST /api/factory/runs/{run_id}/approve`
- `POST /api/factory/runs/{run_id}/reject`
- `GET /api/factory/diagnostics`

Provider job progress still arrives through synced control-plane run fields (`sync.provider_status`, URIs, provenance/manifest metadata).

## Operator visibility improvements

- Explicit transition timeline from `transition_trail` / run events
- Provider failure reason panel (`sync.failure_reason`, `provider_error`, `last_sync_error`)
- Clear backend mode label (`Live provider mode` vs `Mock/stub provider mode`)
- Diagnostics snapshot (`total_runs`, status counts, stuck/failed totals)
- Safe retry path: create a new run from the same plan (no auto-publish)
- Polling resilience: automatic interval backoff on errors + manual refresh + pause/resume polling

## State labeling

Each factory page shows one state badge:

- `Live`: backend call succeeded in live mode
- `Mocked`: integration mode is mock or intentional fallback data is active
- `Failed`: backend call failed; safe fallback data remains visible
- `Waiting for review`: run is at mandatory human-review gate

## Safety positioning

The factory UI never auto-publishes. It enforces operator checkpoints:

- required disclosure banner
- rights assertion checkbox
- synthetic disclosure checkbox
- publish blocked indicator until approval sets `publish_prepare_allowed=true`
