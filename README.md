# Phantom Studio Operator Console

This repository hosts the operator-facing console for Phantom Studio. It renders intake, runs, review, export, publish, provenance, and settings surfaces on top of the control plane and provider gateway. In integration mode, the intake flow now passes through the provider gateway's ingest, transcription, analysis, and clip selection workloads, and the render/export review plus provenance surfaces now pull the provider render summary plus the control-plane export bundle so operators can inspect real metadata before approval; when live endpoints are unreachable the UI clearly labels the mock fallback while still keeping focus on human review, disclosure, and approval guardrails.

## What this console currently does

- Shows a dashboard, runs table, and descriptive timeline using the placeholder data in `lib/runs` while operators inspect stage completion. When integration-mode reads are live, the global runs list and timeline surfaces the backend-provided summaries, not just mocks.
- Provides typed `ControlPlaneClient` and `ProviderGatewayClient` classes with bearer-token scaffolding. When the provider gateway URL/token are configured and `NEXT_PUBLIC_INTEGRATION_MODE=live`, the intake flow submits to the provider’s ingest, transcription, analysis, and clip selection endpoints; otherwise the clients fall back to mocked responses and the UI shows explanatory badges. The settings health view also now hits the real `/health/live` and `/health/ready` endpoints when `mock` mode is disabled.
- Surfaces intake, clip review, caption review, translation, voice/lip-sync, rendering, export, publish scheduling, provenance, and settings UI panels filled with illustrative data.
- Highlights safety signposts: only original/licensed inputs, disclosure labels for synthetic characters, policy and QA status before export, and manual approval indicators before publish scheduling.

## What it is not

- It is not a generator, ingestion service, or media-processing engine. No provider-gateway execution occurs here yet.
- It never auto-publishes. The publish screen expresses intent; only an explicit operator-triggered control plane request moves the job forward.
- It does not facilitate real-person impersonations, stealth deepfakes, or non-consensual voice/identity mimicry.

## Safety boundary

UI copy and docs repeatedly remind operators about rights assertions, disclosure metadata, and the requirement that every publish action is tied to a human review plus approval decision.

## Integration mode

Set `NEXT_PUBLIC_INTEGRATION_MODE` to `live` when the control plane and provider gateway URLs and tokens are configured; this enables the new live health checks along with the read-only runs, run detail, provenance, publish job, and health endpoints. It also flips on the provider gateway's ingest -> transcription -> analysis -> clip selection flow so that the review page surfaces real clip timing, scores, and rationale whenever the matching source/transcript/analysis IDs are saved locally, and the render/export review plus provenance surfaces now pull the provider render summary and the control-plane export/provenance bundles to expose real manifest, checksum, and review-trail data. When `integrationMode` is `mock` (the default) or when the required run/job IDs are not supplied, mock datasets are shown instead and a banner explains that exact IDs are required for live reads.

## Live vs. mock coverage

### Live-read surfaces

- Runs list, run detail, provenance manifest, and publish job status now request the real control-plane endpoints whenever `NEXT_PUBLIC_INTEGRATION_MODE=live` and the backend is reachable; they surface actual stage labels, manifests, attempts, and timestamps instead of mocked placeholders.
- Export review and provenance viewer now hit `/api/renders/{renderId}`, `/workflow-runs/{runId}/export-bundle`, and `/workflow-runs/{runId}/provenance` so the hero card, readiness badges, and manifest panel display live manifest, checksum, and review-trail data when live endpoints are configured.
- Caption review and translation tabs now fetch the provider gateway's `/api/captions/{id}` and `/api/jobs/translate/{id}` endpoints when the integration mode is live, so cues, translations, and quality notes reflect real caption plans instead of the stub tables.
- Voice and lip-sync review badges now also surface whether the panels are showing live provider artifacts or mock fallbacks, and the panels pull `/api/voices/{voiceId}` plus `/api/lipsync/{artifactId}` to display audio/video previews with provenance and disclosure metadata.
- The intake flow submits to the provider gateway ingest, transcription, viral analysis, and clip selection endpoints in live mode, so the review page's clip cards show real rationale, transcript excerpts, and timing instead of the static mock set.
- Settings health panels query both control-plane and provider-gateway `/health/live`+`/health/ready` endpoints in live mode. The integration-mode badge in the toolbar labels whether live reads are running and the cards expose any degraded details returned by the backend.

### Explicit mock fallbacks

- Render/export orchestration, publish job execution, and approval mutations still operate against the mock adapters in `lib/api`. These surfaces describe the eventual workflow without submitting actual mutations.
- Caption review, translation tabs, voice/lip-sync previews, and export metadata panels still highlight when they are showing mock fallback datasets so operators know what is placeholder.

## What is not wired yet

- Approve/reject/request-regenerate mutations, render/export job creation, and publish execution remain mocked to keep the operator experience focused on human review and policy enforcement.

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
- `docs/voice-lipsync-review.md`

## Future work

- Wire the typed API clients to live control-plane/provider-gateway URLs and replace `lib/*/mock` data with the real responses.
- Expand the intake and review data capture to persist actual run metadata and provider IDs.
- Drive the release-candidate branch into `main` once the backend contracts and live endpoints are stable.
