# Intake flow

The intake page is the single source of operator intent when creating a new Phantom Studio workflow. It lets the operator:

- Select the source type (URL or uploaded reference) and supply the asset link for the provider gateway to ingest.
- Name the project or campaign so the control plane can trace releases back to creators or brands.
- Choose between a single "killer short" or a series of up to three clips, then select target platforms and languages for the release.
- Provide style notes (tone, hook instructions) and optional synthetic media preferences for disclosed virtual characters.

Submission flow:

1. The console validates the form via Zod and React Hook Form.
2. On submit, it calls `ControlPlaneClient.createProject` + `ControlPlaneClient.submitRun` to create the project and run records.
3. It then triggers `ProviderGatewayClient.triggerIngest` to create the ingest/analyze job.
4. The UI surfaces an optimistic status badge and “recent jobs” panel driven by `ControlPlaneClient.listRuns`.
5. Errors are surfaced inline and via status text so operators can retry without guessing.
