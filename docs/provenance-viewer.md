# Provenance Viewer

The provenance viewer now talks directly to the control-plane `/workflow-runs/{runId}/provenance` endpoint and displays the real manifest that stitches together assets, provider traces, review decisions, and audit events for each run. When integration mode is live, operators see the same bundle that downstream Liquefy audits and publish adapters will reference.

## Manifest section

- The top card surfaces the checksum and serialized manifest payload so auditors can confirm the bundle matches the stored export bundle. A `Live` badge flags when the data comes from the control plane and a fallback message explains when the UI is showing the sandbox placeholder.

## Provider traces

- Each trace entry shows the provider name, model, prompt text, request/response payloads, and the generated asset IDs so operators can follow how every artifact was produced.
- Prompt artifacts, asset references, and audit events render from the manifest itself, keeping the UI aligned with the actual bundle instead of stale mock data.

## Review trail + export bundle

- The export bundle card now pulls the manifest review trail, so operators can confirm which reviews were included in the bundle and see the recorded disclosure statement.
- When the control plane cannot reach the backend, the viewer surfaces clear `Mock` badges and explanatory messaging while still describing the expected data shape.
