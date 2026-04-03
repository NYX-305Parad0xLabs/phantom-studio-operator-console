# Export Review

The export review screen now fetches the provider-gateway render summary (`GET /api/renders/{renderId}`) plus the control plane export bundle (`POST /workflow-runs/{runId}/export-bundle`) so operators see the real metadata, caption files, and readiness status whenever integration mode is live.

## Render summary

- The hero card surfaces the live preview label, actual duration, and resolution resolved by the provider gateway. The panel shows whether the render and export data came from live endpoints or the mock fallback.
- Render layers now enumerate each recorded stage from the render plan, and completion badges update as soon as the provider emits their metadata. The specification block highlights the captured aspect, codec, and caption formats for downstream adapters.
- Caption JSON output includes the path stored by the provider plus the resolved metadata, and the download control links to the real caption text asset captured during rendering.

## Export payload telemetry

- Suggested title, caption, hashtags, and the rationale text are pulled directly from the publish-ready payload that the provider saved into the render summary. The virality rationale card remains editable guidance for operators before they confirm approval.
- The readiness panel now reflects the presence of the publish-ready payload, manifest checksum, and disclosure metadata, so operators see exactly what is missing before a manual publish step can proceed.
- Status indicators at the top show live vs. mock coverage plus manifest readiness so operators never assume a bundle exists when it still needs to be generated.
