# Intake flow

The intake page is the single source of operator intent when creating a new Phantom Studio workflow. It lets the operator:

- Select the source type (URL or uploaded reference) and supply the asset link for the provider gateway to ingest.
- Name the project or campaign so the control plane can trace releases back to creators or brands.
- Choose between a single "killer short" or a series of up to three clips, then select target platforms and languages for the release.
- Provide style notes (tone, hook instructions) and optional synthetic media preferences for disclosed virtual characters.

Submission flow:

1. The console validates the form via Zod and React Hook Form.
2. On submit, it calls `ControlPlaneClient.createProject` + `ControlPlaneClient.submitRun` to create the project and run records.
3. When the provider gateway integration is live, the same submission also:
   - Creates a `MediaSource` on the provider (`ProviderGatewayClient.createSource`).
   - Starts ingest via `ProviderGatewayClient.createIngestJob` followed by either `ingestUrl` or `ingestUpload` depending on the source type.
   - Triggers transcription through `ProviderGatewayClient.transcribeJob` + `transcribeSource`, then runs viral analysis with `ProviderGatewayClient.analyzeTranscript` so the review cards surface real clip rationale.
   When live mode is disabled or the provider URL/token are missing, the flow simply falls back to the mock data trains defined under `lib/review/mock`.
4. The UI surfaces an optimistic status badge and “recent jobs” panel driven by `ControlPlaneClient.listRuns`.
5. Errors are surfaced inline and via status text so operators can retry without guessing.
