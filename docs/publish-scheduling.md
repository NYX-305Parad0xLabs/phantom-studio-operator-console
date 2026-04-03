# Publish Scheduling

Operators use the publish screen after all review decisions are green. It keeps scheduling human-run posts administrative and explicit.

## Scheduler form

- Platform + account selection ensures exports map to the correct destination.
- UTC date/time entry makes the downstream worker deterministic for the publish window.
- Title/caption overrides are optional editorial notes that accompany the export bundle when the control plane builds the broadcast payload.
- The button remains inert unless a schedule timestamp is provided; the UI reinforces that publishing is gated by the review approval step.

## Status & history

- Status panel lists “Prepared”, “Scheduled”, “Attempted”, “Succeeded”, and “Failed” steps with timestamps so operators see where the publish job currently sits.
- Timeline cards keep a running log of each status change, including details for retries or delays.
- The screen never attempts blind posting; it only packages the payload for future scheduler workers after a human has explicitly approved and scheduled it.
