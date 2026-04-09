# UGC Factory Console

Operator console now ships a real factory vertical slice with route-by-route progression:

- `/factory/intake`: product brief + platform + influencer lock input with mandatory rights/disclosure assertions
- `/factory/plan`: displays generated scene breakdown and provider handoff payload summary
- `/factory/run`: polls run status from control-plane (`queued` -> `running` -> `human_review`)
- `/factory/review`: approval/rejection gate with explicit publish-blocked state until approval
- `/factory/export`: provenance + export bundle visibility

## Backend wiring

The UI uses typed control-plane clients for:
- `POST /api/factory/plans`
- `GET /api/factory/plans/{plan_id}`
- `POST /api/factory/runs`
- `GET /api/factory/runs/{run_id}`
- `POST /api/factory/runs/{run_id}/approve`
- `POST /api/factory/runs/{run_id}/reject`

Provider-gateway status is surfaced through control-plane run synchronization fields (`sync.provider_status`, URIs, provenance/manifest metadata).

## State labeling

Each factory page shows an explicit state badge:
- `Live`: backend call succeeded in live mode
- `Mocked`: integration mode is mock or fallback mock data is used intentionally
- `Failed`: backend call failed; UI keeps safe fallback data visible
- `Waiting for review`: run reached human-review gate

## Safety positioning

The factory UI never auto-publishes. It enforces operator checkpoints:
- required disclosure banner
- rights assertion checkbox
- synthetic disclosure checkbox
- publish blocked indicator until review approval sets `publish_prepare_allowed=true`
