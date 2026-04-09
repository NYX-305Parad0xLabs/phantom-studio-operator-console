# Phantom Studio Operator Console

The operator console orchestrates creator-intent intake, review, approvals, and publish scheduling by wiring the control-plane and provider-gateway surfaces together.

## Demo readiness matrix
| Screen | Live posture | Notes |
| --- | --- | --- |
| Intake | Live reads and writes when the control plane + provider gateway URLs, tokens, and artifact IDs are configured. | Badges, project selection, and intake status show "Live" when integration mode=live and fall back to mocked fixtures when the backend is offline. |
| Runs dashboard | Lists workflow runs and timelines via /workflow-runs in live mode. | The table falls back to the mock row and highlights the data as mocked when the control plane is unreachable. |
| Review | Provider clips, captions, translations, voice, and lip-sync data stream live when the gateway and saved IDs are available. | Each panel surfaces explicit "Mock" badges and fallback copy whenever live artifacts are missing. |
| Export review | Provider render summaries plus the control-plane export bundle card pull real data when the backend reads succeed. | Mock render/export badges and readiness copy make it clear when fallback data is displayed. |
| Provenance | Control-plane provenance bundles, provider traces, and audit events are requested live for the configured run. | Warns and shows canned manifest/traces when the fetch fails. |
| Publish scheduling | Publish-job reads hit /publish-jobs/{id} so the status timeline shows actual attempts. | Scheduler buttons keep the "Mock writes" guardrail until a prepared live job exists, even when the card displays live data. |
| Settings & health | Polls each /health/live and /health/ready endpoint while integration mode=live. | Falls back to the mock connection status set while labeling the data as mocked when the polls fail. |

See docs/demo-status.md for the deeper truth table on every screen.

## Fully live flows
- Control-plane read-only endpoints (/workflow-runs, /provenance, /publish-jobs) answer immediately whenever the URLs, tokens, and integration mode are configured.
- Provider-gateway ingest ? transcription ? analysis ? clip selection reads run live as soon as the provider URL/token and default artifact IDs are supplied.
- The settings + health dashboard polls the real /health endpoints so the UI can declare when each backend is live.

## Live with fallback
- Review captions, translations, voice, and lip-sync assets show live provider artifacts when available, yet they keep explicit "Mock ..." badges and copy whenever they fall back to canned data.
- Export review renders the live summary and bundle when the backend delivers data, but the readiness badges keep explaining when mock fallback has been triggered.
- Publish scheduling reads real publish-job states; the form still warns that writes remain mocked until a prepared job exists.
- Runs and intake still rerender their mock fixtures when live reads fail while highlighting the integration mode.

## Still mocked flows
- Approval decisions (approve, reject, request-regenerate) remain simulated inside the console so the human-review gate cannot be bypassed.
- Publish execution is mocked until the backend-side endpoint is confirmed safe for auto-triggering; the execute button stays guarded.
- Feature flags, QA events, review history, and supporting panels continue to draw from local mock data under lib/*/mock*.

## Demo configuration
To run the console in demo-ready live mode, copy .env.example to .env.local and provide the following values:
1. NEXT_PUBLIC_CONTROL_PLANE_URL and NEXT_PUBLIC_PROVIDER_GATEWAY_URL pointing at the FastAPI backends.
2. NEXT_PUBLIC_OPERATOR_TOKEN and NEXT_PUBLIC_PROVIDER_TOKEN containing valid bearer tokens for operator/admin roles.
3. NEXT_PUBLIC_INTEGRATION_MODE=live to unlock the live reads.
4. NEXT_PUBLIC_DEFAULT_WORKFLOW_RUN_ID and NEXT_PUBLIC_DEFAULT_PUBLISH_JOB_ID so the console can target a live run and job.
5. Provider artifact overrides (NEXT_PUBLIC_PROVIDER_TRANSCRIPT_ID, NEXT_PUBLIC_PROVIDER_ANALYSIS_ID, NEXT_PUBLIC_PROVIDER_CAPTION_ID, NEXT_PUBLIC_PROVIDER_VOICE_ID, NEXT_PUBLIC_PROVIDER_LIPSYNC_ID, NEXT_PUBLIC_PROVIDER_RENDER_ID) so review/export pages resolve live assets.
6. Optionally adjust NEXT_PUBLIC_PROVIDER_TRANSLATION_TARGETS to tune the localized caption tabs.
7. Restart the dev server after changing .env.local.
8. Confirm the settings page shows live badges for both backends before trusting the rest of the UI.

Detailed per-screen status and fallback copies live in docs/demo-status.md.

## Autonomous UGC factory additions
- Route-based operator flow:
  - `/factory/intake`
  - `/factory/plan`
  - `/factory/run`
  - `/factory/review`
  - `/factory/export`
- Live control-plane factory endpoints:
  - `POST /api/factory/plans`
  - `GET /api/factory/plans/{plan_id}`
  - `POST /api/factory/runs`
  - `GET /api/factory/runs/{run_id}`
  - `POST /api/factory/runs/{run_id}/approve`
  - `POST /api/factory/runs/{run_id}/reject`
- Provider job progress is surfaced through synced control-plane run data.
- UI state is explicitly labeled `Live`, `Mocked`, `Failed`, or `Waiting for review`.
- No auto-publish behavior in factory flow; publish remains blocked until review approval.
- See `docs/ugc-factory-console.md`.

## Cross-repo local stack

Run the full stack via the integration compose in the control-plane repo:
- `phantom-studio-control-plane/docker-compose.integration.yml`
- `phantom-studio-control-plane/.env.integration.example`

Then open `http://localhost:3000/factory`.

Honest UI status rules:
- `Live` when control-plane/provider requests succeed.
- `Mocked` when fallback data is being shown.
- `Failed` when live calls fail and no fallback could satisfy the screen.
- `Waiting for review` when factory run status is `human_review`.

## Readiness classification

- Current status: **demo-ready, dev-only**
- Not yet pilot-ready or production-ready.
