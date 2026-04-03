# Caption Review

The caption review surface mirrors the control-plane’s insistence on transparency: operators see the exact timed cues, emphasis markers, emoji hints, and disclosure-aware messaging before approving any publishable asset.

## Timed cue list

- Every cue exposes start/end timestamps, the captured text, emphasis words that guide bold styling, and emoji suggestions for rendering attention.
- Flagging a cue signals the review service that a rewrite should be queued before any publish preparation can proceed.
- Cues surface within the console as self-contained cards to keep timing, transcript, and style details in one glance.

## Preview overlay

- A deterministic mock preview illustrates how captions land over the short-form frame, using the active style preset metadata (palette, description, accent name).
- Toggleable style presets keep the styling rules explicit while staying renderer-agnostic.

## Localization tabs

- Translation tabs showcase each localized caption stream alongside a “Source” view.
- When a localization tab is active, the panel renders a diff-style comparison with the original text so operators can confirm faithfulness and timing alignment.
- Quality notes surface per locale so any known trade-offs are transparent.

## Operator actions

- “Approve captions” toggles the console state and prepares the captions for downstream gating.
- “Flag cue for rewrite” persists a discrete indicator that the review pipeline can inspect later.
- “Switch style preset” rotates through curated palettes without hard coding the UI’s renderer.

## Safety boundary

All captions remain faithful to spoken content. Localization tabs highlight when translation variants differ so no machine translation is mistaken for a final deliverable. Fake or manipulated quotes are disallowed, and every change path is clearly traceable from the console to the control-plane review services.
