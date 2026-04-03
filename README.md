# Phantom Studio Operator Console

This repository hosts the operator-facing console for Phantom Studio. It renders intake, runs, review, export, publish, provenance, and settings surfaces on top of the control plane and provider gateway. All backend responses are currently mocked, so the UI focuses on human review, disclosure, and approval guardrails rather than executing provider workloads.

## What this console currently does

- Shows a dashboard, runs table, and descriptive timeline using the placeholder data in `lib/runs` while operators inspect stage completion. When integration-mode reads are live, the global runs list and timeline surfaces the backend-provided summaries, not just mocks.
- Provides typed `ControlPlaneClient` and `ProviderGatewayClient` classes with bearer-token scaffolding; they default to mocked responses until real endpoints are wired. The settings health view also now hits the real `/health/live` and `/health/ready` endpoints when `mock` mode is disabled.
- Surfaces intake, clip review, caption review, translation, voice/lip-sync, rendering, export, publish scheduling, provenance, and settings UI panels filled with illustrative data.
- Highlights safety signposts: only original/licensed inputs, disclosure labels for synthetic characters, policy and QA status before export, and manual approval indicators before publish scheduling.

## What it is not

- It is not a generator, ingestion service, or media-processing engine. No provider-gateway execution occurs here yet.
- It never auto-publishes. The publish screen expresses intent; only an explicit operator-triggered control plane request moves the job forward.
- It does not facilitate real-person impersonations, stealth deepfakes, or non-consensual voice/identity mimicry.

## Safety boundary

UI copy and docs repeatedly remind operators about rights assertions, disclosure metadata, and the requirement that every publish action is tied to a human review plus approval decision.

## Integration mode

Set `NEXT_PUBLIC_INTEGRATION_MODE` to `live` when the control plane and provider gateway URLs and tokens are configured; this enables the new live health checks along with the read-only runs, run detail, provenance, publish job, and health endpoints. When `integrationMode` is `mock` (the default) or when the required run/job IDs are not supplied, mock datasets are shown instead and a banner explains that exact IDs are required for live reads.

## Live vs. mock coverage

### Live-read surfaces

- Runs list, run detail, provenance manifest, and publish job status now request the real control-plane endpoints whenever `NEXT_PUBLIC_INTEGRATION_MODE=live` and the backend is reachable; they surface actual stage labels, manifests, attempts, and timestamps instead of mocked placeholders.
- Settings health panels query both control-plane and provider-gateway `/health/live`+`/health/ready` endpoints in live mode. The integration-mode badge in the toolbar labels whether live reads are running and the cards expose any degraded details returned by the backend.

### Explicit mock fallbacks

- The intake page, decision submission panel, render/export placeholders, and publish job execution screen still operate against the mock adapters under `lib/api`. These surfaces still describe the eventual workflow without submitting actual mutations.
- Any area that depends on a future backend capability (e.g., localized caption translation, voice/lip-sync detail persistence) highlights that it is mocked when live mode is disabled or when the required backend data is missing.

## What is not wired yet

- Intake creation, approve/reject/regenerate mutations, render/export job creation, and publish execution remain mocked to keep the operator experience focused on human review and policy enforcement.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_CONTROL_PLANE_URL`, `NEXT_PUBLIC_PROVIDER_GATEWAY_URL`, and token placeholders as needed.
2. `npm install`
3. `npm run dev`

## Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify` (runs `lint`, `typecheck`, `test`, and `build` in order via `scripts/verify.sh`)
- `npm run dev:smoke` (runs `tests/smoke/routes.test.tsx` through `ts-node scripts/dev-smoke.ts` to ensure each major route renders the current placeholders)

## Docs

- `docs/architecture.md`
- `docs/routes.md`
- `docs/safety-boundary.md`
- `docs/settings-and-health.md`
- `docs/backend-contracts.md`
- `docs/release-checklist.md`
- `docs/intake-flow.md`
- `docs/runs-dashboard.md`
- `docs/clip-review.md`
- `docs/caption-review.md`
- `docs/voice-lipsync-review.md`
- `docs/export-review.md`
- `docs/publish-scheduling.md`
- `docs/provenance-viewer.md`
- `docs/approval-flow.md`

## Future work

- Wire the typed API clients to live control-plane/provider-gateway URLs and replace `lib/*/mock` data with the real responses.
- Expand the intake and review data capture to persist actual run metadata and provider IDs.
- Drive the release-candidate branch into `main` once the backend contracts and live endpoints are stable.
