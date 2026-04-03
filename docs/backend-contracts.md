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

- **Endpoints** (stubbed until live):
  - `/ingest`, `/transcribe`, `/analyze`, `/select-clip`, `/render`, `/export` etc. The console templates data from `lib/export/mockReview.ts` and `lib/provenance/mock.ts` for the provenance/review panels.
  - `POST /publish-jobs` / `/publish-jobs/{jobId}` for scheduling.
- **Data contracts**: typed input/output shapes mirror the stub modules under `lib/export`, `lib/provenance`, and `lib/publish`.
- When wiring real services, ensure the provider gateway returns the metadata used by the console (captions, translations, voice/lip-sync, manifest checksums) and keeps the same field names as the mock modules.

## Auth & tokens

- `NEXT_PUBLIC_OPERATOR_TOKEN` and `NEXT_PUBLIC_PROVIDER_TOKEN` feed into `lib/config.ts` and drive the badge states in `app/settings`.
- The console only displays token presence (`configured` / `missing`); actual tokens remain server-side.
