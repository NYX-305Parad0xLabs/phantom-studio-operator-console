# Phantom Studio Operator Console

This repository hosts the operator-facing console for Phantom Studio. It renders intake, runs, review, export, publish, provenance, and settings surfaces on top of the control plane and provider gateway. All backend responses are currently mocked, so the UI focuses on human review, disclosure, and approval guardrails rather than executing provider workloads.

## What this console currently does

- Shows a dashboard, runs table, and descriptive timeline using the placeholder data in `lib/runs` while operators inspect stage completion.
- Provides typed `ControlPlaneClient` and `ProviderGatewayClient` classes with bearer-token scaffolding; they default to mocked responses until real endpoints are wired.
- Surfaces intake, clip review, caption review, translation, voice/lip-sync, rendering, export, publish scheduling, provenance, and settings UI panels filled with illustrative data.
- Highlights safety signposts: only original/licensed inputs, disclosure labels for synthetic characters, policy and QA status before export, and manual approval indicators before publish scheduling.

## What it is not

- It is not a generator, ingestion service, or media-processing engine. No provider-gateway execution occurs here yet.
- It never auto-publishes. The publish screen expresses intent; only an explicit operator-triggered control plane request moves the job forward.
- It does not facilitate real-person impersonations, stealth deepfakes, or non-consensual voice/identity mimicry.

## Safety boundary

UI copy and docs repeatedly remind operators about rights assertions, disclosure metadata, and the requirement that every publish action is tied to a human review plus approval decision.

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
