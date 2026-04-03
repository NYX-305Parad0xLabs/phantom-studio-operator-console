# Routes

- `/` - Dashboard that surfaces pending jobs, review counts, and quick highlights for the intake, series, and review stages.
- `/intake` - Intake flow captures source URLs/uploads, project metadata, clip intent (one killer short vs. series), target platforms/languages, style notes, and optional synthetic disclosure details before creating the run. When `NEXT_PUBLIC_INTEGRATION_MODE=live` and the provider gateway URL/token are configured, it also kicks off the provider ingest, transcription, analysis, and clip selection pipeline.
- `/projects` - Project management list referencing creators, media rights, and aggregated health metrics.
- `/runs` - Workflow run timeline with stages from ingest to review.
- `/review` - Human review surface for captions, translations, voice, and lip-sync artifacts.
- `/exports` - Inspect normalized export bundles and metadata before scheduling publish actions.
- `/publish` - Schedule publish-ready payloads through the control plane (manual trigger only).
- `/provenance` - Trace provider logs, prompt artifacts, and audit events for compliance.
- `/settings` - Configure base URLs, tokens, and diagnostics for both backends.
