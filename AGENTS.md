# AGENTS instructions for this repo

## Purpose
- Host the Phantom Studio operator console: intake, runs, review, export, publish, provenance, and settings dashboards on top of the control plane and provider gateway backends.
- Keep the console lightweight so it can be wired to the orchestration stack without imposing new runtime dependencies.

## Safety boundary
- Only support original or licensed source content and disclosed synthetic characters. No real-person impersonations, stealth deepfakes, or non-consensual identity mimicry under any workflow.
- Human review is the gatekeeper; publishing always requires an explicit operator action after approval.
- All provider integrations are mocked/stubbed in the current release candidate; surface that fact in copy and docs.

## Coding conventions
- Use strong TypeScript types, Next.js App Router, React server/client separation, and Tailwind for styling.
- Keep modules focused, avoid import-time side effects, and prefer data/localization helpers in `lib/*`.
- Favor shadcn-style UI primitives with light wrappers; avoid over-engineering this release pass.
- Respect the repository-wide theme tokens and keep UI copy technical (no marketing hyperbole).

## Testing commands
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run verify` (runs lint, typecheck, test, and build via `scripts/verify.sh`)
- `npm run dev:smoke` (validates that each major route renders its placeholder UI)

## Build commands
- `npm run build`

## Branch naming
- Regular work uses `feat/*`, `fix/*`, or `chore/*`. Release candidates use `chore/operator-console-release-candidate`.
- Avoid rewriting history; branch from the latest feature branch or `main` and merge via PRs or release-candidate flows.

## Do not
- Do not claim the console runs real provider workloads yet; doc copy should call out the mocks.
- Do not add autopublish actions or bypass the control plane’s review gate.
- Do not leak auth tokens in UI layers; the console only surfaces `configured` / `missing` badges.
