export type PublishTarget = {
  id: string;
  slug: string;
  platform: string;
  account: string;
  label: string;
};

export type PublishAttemptStatus =
  | "prepared"
  | "scheduled"
  | "attempted"
  | "succeeded"
  | "failed";

export type PublishAttempt = {
  id: string;
  status: PublishAttemptStatus;
  timestamp: string;
  detail: string;
  latency?: string;
};

export type PublishJob = {
  id: string;
  runId: string;
  target: PublishTarget;
  schedule?: string;
  scheduled_for?: string;
  captionOverride?: string;
  titleOverride?: string;
  status: PublishAttemptStatus;
  attempts: PublishAttempt[];
};

export const mockPublishTargets: PublishTarget[] = [
  {
    id: "pt-01",
    slug: "tiktok",
    platform: "TikTok",
    account: "@paradox.studio",
    label: "Primary brand",
  },
  {
    id: "pt-02",
    slug: "instagram",
    platform: "Instagram Reels",
    account: "paradox.click",
    label: "Creator hub",
  },
];

export const mockPublishJob: PublishJob = {
  id: "publish-001",
  runId: "run-123",
  target: mockPublishTargets[0],
  scheduled_for: "2026-04-04T17:30:00Z",
  captionOverride: "Bold synthetic reveal, tagging the team.",
  titleOverride: "Phase One: Disclosure-ready short",
  status: "scheduled",
  attempts: [
    {
      id: "att-001",
      status: "prepared",
      timestamp: "2026-04-03T10:00:00Z",
      detail: "Export bundle verified and ready.",
    },
    {
      id: "att-002",
      status: "scheduled",
      timestamp: "2026-04-03T10:05:00Z",
      detail: "Operator scheduled publish window.",
    },
  ],
};
