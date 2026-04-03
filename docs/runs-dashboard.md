# Runs Dashboard

The runs page presents every workflow job from ingest through review/publish prep. Key features:

- **Runs table**: Displays run ID, project, source type, current stage, status badge, last update, and platform targets. Stage and status badges are mapped via `lib/runs/status.ts` to keep the UI aligned with backend enums.
- **Filters**: Operators can filter by stage, status, project name, or source type before consuming the timeline.
- **Detail drill-down**: Clicking a run ID opens `/runs/[runId]`, which surfaces a timeline of stage completion with last-updated timestamps.
- **Refresh**: React Query polls every 10 seconds so the dashboard reflects ongoing provider-gateway processing and control-plane approvals without manual refresh.
- **Safety**: Every run shows the source type and platform targets so operators can trace ingest intents before triggering human reviews.
