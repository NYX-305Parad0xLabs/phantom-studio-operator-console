export const runStageOrder = [
  "character_prepare",
  "image_generate",
  "video_generate",
  "script_generate",
  "voice_generate",
  "lipsync_generate",
  "qa_validate",
  "human_review",
  "publish_prepare",
] as const;

export type RunStage = (typeof runStageOrder)[number];

export type RunStageStatus = "pending" | "running" | "completed" | "failed";

export type StageBadgeVariant = "muted" | "accent" | "success" | "outline";

export const statusBadgeMap: Record<RunStageStatus, StageBadgeVariant> = {
  pending: "muted",
  running: "accent",
  completed: "success",
  failed: "outline",
};

export function getStageLabel(stage: RunStage): string {
  switch (stage) {
    case "character_prepare":
      return "Character prep";
    case "image_generate":
      return "Image";
    case "video_generate":
      return "Video";
    case "script_generate":
      return "Script";
    case "voice_generate":
      return "Voice";
    case "lipsync_generate":
      return "Lip sync";
    case "qa_validate":
      return "QA";
    case "human_review":
      return "Review";
    case "publish_prepare":
      return "Publish";
  }
}
