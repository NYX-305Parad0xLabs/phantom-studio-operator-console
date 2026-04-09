# Autonomous UGC Factory Extensions

## New structure

- `app/factory/page.tsx`  
  One-click factory flow UI for product brief -> plan -> multi-shot render output.
- `lib/api/controlPlane.ts`  
  Adds factory plan client methods:
  - `createFactoryPlan(runId, payload)`
  - `fetchFactoryPlan(runId)`
- `lib/api/providerGateway.ts`  
  Adds:
  - `generateMultiShotVideo(payload)`
  - `MultiShotVideoRequest/Response` types
- `lib/navigation.ts`  
  Adds the `Factory` route in sidebar navigation.

## Behavior

The Factory page executes:

1. Submit makeup product payload to control plane plan endpoint.
2. Receive script, shot prompts, backend selection, and NULLA handoff tasks.
3. Submit scene package to provider gateway `POST /api/video/multi-shot`.
4. Display stitched output URI and shot outputs for review/export.
