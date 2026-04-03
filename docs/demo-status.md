# Demo status reference

This document explains which operator-console surfaces are wired to live backends, which ones fall back to mocked data, and which remain simulated so the demo stays honest.

## Screen statuses
| Screen | Live posture | Fallback behavior |
| --- | --- | --- |
| Intake | Live reads and writes when both gateways, tokens, and artifact IDs are configured with integration mode=live. | Shows a Live badge and sends ingest/transcription/analysis/clip requests to the provider gateway; falls back to mocked fixtures and a clear Mock banner whenever the backend is unavailable. |
| Runs dashboard | Reads /workflow-runs when the control plane URL is live. | Renders the canned run row and notes the mocked data when the backend is unreachable. |
| Review | Provider clips, captions, translations, voice, and lip-sync panels read live artifacts when the provider IDs are set. | Every panel keeps explicit Mock badges and copy whenever those artifacts are missing or integration mode=mock. |
| Export review | Provider render summary and control-plane export bundle respond with live metadata when the APIs succeed. | Displays Mock render / Mock export badges and readiness copy when fallback data is rendered. |
| Provenance | Control-plane provenance bundles, provider traces, and audit events stream live when the run ID and base URL are configured. | Falls back to the canned manifest/traces plus an inline warning when the fetch fails. |
| Publish scheduling | Querying /publish-jobs/{id} reflects the live job status in integration mode=live. | Scheduler buttons keep the Mock writes guardrail until a prepared live job exists, even when the card is showing mock data. |
| Settings & health | Polls /health/live and /health/ready for both services whenever integration mode=live. | Falls back to the mock connection status set while calling out that the data is mocked when the health checks fail. |

## What is fully live
- Control-plane read endpoints (/workflow-runs, /provenance, /publish-jobs) reply with real data whenever the URLs, tokens, and integration mode are configured.
- Provider-gateway ingest -> transcription -> analysis -> clip selection reads run live when the gateway URL/token plus the default artifact IDs are provided.
- The settings health dashboard polls the real /health/live and /health/ready endpoints so the UI can report true connectivity before trusting other panels.

## What is live with fallback
- Review captions, translations, voice, and lip-sync assets surface real artifacts when the provider returns them but keep Mock badges and fallback cues when the gateway cannot deliver.
- Export review pulls the live render summary and export bundle but keeps the readiness copy and badges to explain mock fallback whenever the backend cannot be reached.
- Publish scheduling reads publish-job state from the control plane, yet the scheduler actions continue to warn that writes are mocked until a prepared job is confirmed.
- Intake and runs dashboards rerender mock previews whenever live reads fail, while still honoring the configured integration mode.

## What remains mocked
- Approval decisions (approve, reject, request-regenerate) and publish execution remain simulated to enforce the human-review gate.
- Feature flags, QA events, review notes, and supplementary panels still read from the local mock definitions in lib/*/mock*.
- The publish scheduler never auto-triggers without an explicit execute click, preserving the manual guardrail.

## Demo configuration essentials
1. Copy .env.example to .env.local.
2. Set NEXT_PUBLIC_CONTROL_PLANE_URL and NEXT_PUBLIC_PROVIDER_GATEWAY_URL to the FastAPI endpoints.
3. Populate NEXT_PUBLIC_OPERATOR_TOKEN and NEXT_PUBLIC_PROVIDER_TOKEN with bearer tokens that grant the correct roles.
4. Set NEXT_PUBLIC_INTEGRATION_MODE=live to unlock the live reads.
5. Provide NEXT_PUBLIC_DEFAULT_WORKFLOW_RUN_ID and NEXT_PUBLIC_DEFAULT_PUBLISH_JOB_ID so the console targets a real run and job.
6. Feed the provider artifact overrides (NEXT_PUBLIC_PROVIDER_TRANSCRIPT_ID, NEXT_PUBLIC_PROVIDER_ANALYSIS_ID, NEXT_PUBLIC_PROVIDER_CAPTION_ID, NEXT_PUBLIC_PROVIDER_VOICE_ID, NEXT_PUBLIC_PROVIDER_LIPSYNC_ID, NEXT_PUBLIC_PROVIDER_RENDER_ID) so the review/export chains resolve live assets.
7. Optionally override NEXT_PUBLIC_PROVIDER_TRANSLATION_TARGETS for the localized caption tabs.
8. Restart the dev server after editing .env.local and confirm the settings page reports live badges for both backends before trusting other screens.

## Safety guardrails
- Every panel reminds operators about disclosed synthetic creators, manual approvals, and the prohibition on blind autopublish before they act.
- Publish scheduling never fires automatically; the execute button is disabled until a live job exists and the operator clicks it explicitly.
- The review, export, and provenance panels keep showing disclosure metadata, review trail entries, and manifest details so the provenance chain is always visible.
