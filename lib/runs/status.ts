export const runStageOrder = [
  "ingest",
  "transcription",
  "viral_analysis",
  "clip_selection",
  "captions",
  "translation",
  "voice",
  "lipsync",
  "render_export",
  "review_publish",
] as const;

export type RunStage = (typeof runStageOrder)[number];

export type RunStageStatus = "pending" | "running" | "complete" | "blocked" | "failed";

export type StageBadgeVariant = "muted" | "accent" | "success" | "outline";

export const statusBadgeMap: Record<RunStageStatus, StageBadgeVariant> = {
  pending: "muted",
  running: "accent",
  complete: "success",
  blocked: "outline",
  failed: "outline",
};

export function getStageLabel(stage: RunStage): string {
  switch (stage) {
    case "ingest":
      return "Ingest";
    case "transcription":
      return "Transcription";
    case "viral_analysis":
      return "Analysis";
    case "clip_selection":
      return "Clip selection";
    case "captions":
      return "Captions";
    case "translation":
      return "Translation";
    case "voice":
      return "Voice";
    case "lipsync":
      return "Lip sync";
    case "render_export":
      return "Render/Export";
    case "review_publish":
      return "Review/Publish";
  }
}
