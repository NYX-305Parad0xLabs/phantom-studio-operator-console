# Settings & Health

The settings page gives operators visibility into the console’s connectivity, authorization readiness, and diagnostics without leaking secrets.

## Connection panels

- Control-plane and provider-gateway connection cards show the base URL, live/ready badges, last check time, and degraded messaging when a ready signal is missing.
- Health dashboard duplicates the statuses in a timeline view, ensuring the operator can spot when a service dropped or is warming up.

## Auth visibility

- Auth status cards expose only whether the operator/provider tokens are configured—not the tokens themselves—so no credentials appear in the browser.
- The panel also summarizes the localization around tokens to encourage operators to manage them via environment variables (see README).

## Features & diagnostics

- Feature flag panel lists current toggles with descriptions so wings can quickly see what preview behavior is enabled.
- The health dashboard message includes the last fetch time and a simple “degraded” summary when ready checks fail.
  
Create new environment overrides via `.env.local` and restart the console to refresh the statuses; they remain read-only inside the UI.
