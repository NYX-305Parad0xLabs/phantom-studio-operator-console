# Backend contracts

The operator console speaks to the control plane and provider gateway via the typed clients in `lib/api`. Each client uses bearer auth tokens stored in the environment, and the console never hard-codes provider credentials.

## Control plane (`lib/api/controlPlane.ts`)

- **Endpoints** (mocked when `NEXT_PUBLIC_CONTROL_PLANE_URL` is empty):
  - `GET /runs`, `/runs/{runId}` — list and detail of workflow runs.
  - `POST /workflow-runs` — intake submissions.
  - `POST /workflow-runs/{id}/approve|/reject|/request-regenerate` — decision mutations from the review panel.
  - Additional endpoints (health, publish jobs, QA) must follow the same bearer-token contract when wired.
- **Data contracts**: `WorkflowRunSummary`, `WorkflowRunDetail`, `DecisionSubmission`.
- UI surfaces call these through `ControlPlaneClient` with optimistic local mocks when the base URL is absent.

## Provider gateway (`lib/api/providerGateway.ts`)

- **Live endpoints** (enabled when `NEXT_PUBLIC_INTEGRATION_MODE=live` and the provider URL/token are configured):
  - `/api/sources`, `/api/jobs/ingest`, `/api/jobs/transcribe/{sourceId}`, `/api/jobs/analyze/{transcriptId}`, `/api/analyses/{analysisId}`, and `/api/clips/{clipId}` feed the intake, ingest pipeline, and clip review surfaces with real assets, transcripts, analysis signals, and rationale.

- **Stubbed endpoints** (remain mocked until additional backend contracts are wired):
  - Caption generation, translation batches, voice tracks, lip-sync renders, edit/render/export orchestration, and publish scheduling still draw from the stub modules under `lib/export`, `lib/provenance`, and `lib/publish`.

- **Data contracts**: The console shapes mirror the provider gateway’s Pydantic models. Keep the JSON field names in snake_case so they align with the FastAPI schemas, and re-use the existing `ProviderGatewayClient` helpers when wiring new endpoints.

## Auth & tokens

- `NEXT_PUBLIC_OPERATOR_TOKEN` and `NEXT_PUBLIC_PROVIDER_TOKEN` feed into `lib/config.ts` and drive the badge states in `app/settings`.
- The console only displays token presence (`configured` / `missing`); actual tokens remain server-side.
