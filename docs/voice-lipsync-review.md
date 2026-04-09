# Voice & Lip-sync Review

The voice and lip-sync preview panel focuses on the provenance, disclosure, and execution metadata that keep the operator console aligned with Parad0x safety rules.

## Audio + video previews

- The live panel renders the audio track from `/api/voices/{voiceId}` and the corresponding lip-sync video from `/api/lipsync/{artifactId}` so operators can hear the synthetic creator voice and see the generated avatar performance before approving.
- When the gateway is unreachable or when the required IDs are missing, explicit “Mock voice” / “Mock lip-sync” badges appear, the preview elements fall back to the stub media, and the copy explains that live playback requires an enabled `NEXT_PUBLIC_PROVIDER_VOICE_ID` / `NEXT_PUBLIC_PROVIDER_LIPSYNC_ID`.

## Provenance and disclosure

- Voice artifacts include a provenance payload that lists the provider/model, request metadata (script, profile, etc.), and response metadata (duration, channels, etc.). This is rendered as a condensed JSON trace to keep the audit trail accessible.
- Lip-sync artifacts surface the disclosure label, the original character reference, and the consent flag. The panel highlights these fields so operators cannot miss that the content is an original synthetic creator with explicit consent rather than an impersonation.

## Safety boundaries

- The UI emphasizes that the preview only renders content when the control plane has marked the run as “original synthetic” (the control plane enforces the `is_original_character` and disclosure fields). The console never synthesizes impersonations or real-person mimicry, and manual review is required before any publish action.
