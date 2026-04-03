# Settings & Health

This doc explains how the operator console tracks connectivity, diagnostics, and integration mode so human operators can trust what they see in the settings panel.

## Integration mode and live health checks

- When `NEXT_PUBLIC_INTEGRATION_MODE=live` (and the required URLs/tokens are provided), the console calls `/health/live` and `/health/ready` on both the control plane and provider gateway. Each connection panel reflects the live/ready badge, timestamp, and ready message returned by the backend.
- When live mode is disabled or any of the live calls fail, the UI falls back to the mock statuses defined in `mockConnectionStatuses` and surfaces the offline/degraded badges plus a note that the data is mocked.
- The health dashboard duplicates those statuses in a simple timeline so operators see the last fetch time and whether the ready signal dropped. The integration-mode badge in the toolbar labels the current mode as “mock” or “live”.

## Connection panels

- Each panel shows the base URL, live/ready badges, and the last checked timestamp string. The badges switch to “Live”/“Ready” when the backend reports those states and to “Offline”/“Degraded” when the live endpoint is not healthy or when mock mode is active.
- Smart messaging keeps secrets out of the UI: if a backend reports a detail string, the panel prints it as a diagnostic note but never the tokens themselves.

## Auth visibility

- Auth cards show whether the operator/provide tokens are configured and label them “configured” or “missing”.
- The cards encourage environment-based overrides so operators do not type tokens directly in the browser.

## Feature & diagnostics

- Feature flag cards document the currently enabled toggles; they still run off the mock dataset because live feature management is not wired yet.
- The health dashboard repeats the ready/last-check timeline so operators can correlate degraded states with review paths.

## Local changes

- Copy `.env.example` to `.env.local` and set the backend URLs and bearer tokens required for live mode.
- Restart the console whenever you edit the connection strings so the health polling picks up the new values.
