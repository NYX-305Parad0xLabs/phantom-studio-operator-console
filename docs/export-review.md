# Export Review

The export review screen is where operators inspect the fully-rendered short-form bundle before scheduling any publish action. It links the provider-gateway assets with the control-plane safety gate so every payload is traceable, disclosed, and approval-ready.

## Render summary

- The hero card surfaces the mock preview, duration, resolution, and the overall render narrative so the operator can confirm the expected visual + audio fingerprint.
- Render layers list the discrete steps (source trim, captions, voice mix, export render) with completion badges so nothing is assumed done until green.
- Export preset metadata highlights aspect ratio, codec, and caption formats so downstream publishing adapters get consistent signals.

## Caption telemetry

- The caption JSON preview is stored inside a scrollable `<pre>` block that mirrors what will be handed to the control plane. Metadata includes disclosure statements and checksums to anchor transparency claims.
- Caption file download simulated state makes it easy to prove that assets exist under the configured data path.

## Suggested posting payload

- Suggested title, caption, and hashtags are editorial reminders generated from the viral rationale heuristics.
- The rationale section explains why this clip scores high (hooks, energy, disclosure callouts) without overpromising.

## Publish-readiness panel

- Status badges show readiness (`Ready for human approval`) as well as potential blocks (`Blocked pending review`, `Blocked pending export issue`), keeping the operator aware of gating signals.
- The panel enumerates approval, disclosure, export bundle, and policy states with either “Ready” or “Blocked” badges so downstream services can mirror the status report.
- Nothing auto-publishes—this screen is strictly for verification before the control plane or DNA-X402 operator schedules the outbound job.
