# Phantom Studio Operator Console

This repo hosts the operator-facing console for Phantom Studio. It is the dashboard, intake surface, and review gate that sits on top of:

- [phantom-studio-control-plane](https://github.com/NYX-305Parad0xLabs/phantom-studio-control-plane) (workflow orchestration, review gate, human approvals)
- [phantom-studio-provider-gateway](https://github.com/NYX-305Parad0xLabs/phantom-studio-provider-gateway) (provider contracts, stubbed media assets, export bundles)

## What this console does

- Provides a sidebar navigation of each workflow stage: intake, project management, run tracking, human review, export inspection, publish scheduling, provenance, and settings.
- Displays a top status bar with the current job indicator and allows operators to focus on “one killer short” or “series” workflows.
- Offers typed API scaffolding (`ControlPlaneClient`, `ProviderGatewayClient`) that will call the two backends once their endpoints are wired.
- Enforces the safety boundary by surfacing rights assertions, disclosure states, and provider provenance before publishing actions.

## What it is not

- This console does **not** host generator models, perform actual ingest/transcribe/render tasks, or bypass the control plane’s human review/hard-coded guard rails.
- It does **not** auto-publish; every publish action originates from an explicit operator request and references the control plane’s approvals.
- It is not a playground for real-person impersonations, stealth deepfakes, or non-consensual identity mimicry.

## Safety boundary

Operators are reminded via the UI copy (intake steps, review notices, etc.) that only original or licensed content is permitted, and any synthetic character must include disclosure metadata. Real-person impersonation workflows are blocked by design, and the publish workflow remains manual.

## Local setup

1. Copy `.env.example` to `.env.local` and supply real URLs/tokens for the control plane and provider gateway when they exist.
2. Install dependencies: `npm install`.
3. Run the dev server: `npm run dev`.

The console uses Next.js 16+, Tailwind CSS, TanStack Query, React Hook Form, Zustand, and shadcn-style components with a dark-first Parad0x palette.

## Scripts

- `npm run lint` — runs Next.js linting.
- `npm run typecheck` — runs `tsc --noEmit`.
- `npm run test` — runs the Vitest suite.
- `npm run build` — builds the production output.

## Docs

- Architecture: `docs/architecture.md`
- Routes: `docs/routes.md`
- Safety boundary: `docs/safety-boundary.md`

## Future work

- Wire the typed API clients to live control plane/provider endpoints.
- Add Playwright smoke tests for the review & publish flows.
- Replace placeholder pages with real intake forms, review tables, and export manifests.
