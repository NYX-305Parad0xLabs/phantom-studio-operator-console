export type RunHistoryEventType = "qa" | "review" | "approval";

export type RunHistoryEvent = {
  id: string;
  type: RunHistoryEventType;
  title: string;
  timestamp: string;
  author: string;
  detail: string;
  outcome?: string;
};

export const mockRunHistory: RunHistoryEvent[] = [
  {
    id: "evt-001",
    type: "qa",
    title: "Automated QA pass",
    timestamp: "2026-04-03T09:12:00Z",
    author: "qa-bot",
    detail:
      "Duration/codec checks completed. Captions and audio present. No policy flags.",
    outcome: "Passed",
  },
  {
    id: "evt-002",
    type: "review",
    title: "Caption review investor reveal",
    timestamp: "2026-04-03T09:17:00Z",
    author: "operator-alex",
    detail: "Approver confirmed bold captions with disclosure mention.",
    outcome: "Approved",
  },
  {
    id: "evt-003",
    type: "review",
    title: "Voice + persona review",
    timestamp: "2026-04-03T09:21:00Z",
    author: "operator-alex",
    detail: "Provenance metadata pinned, synthetic profile within policy.",
    outcome: "Approved",
  },
  {
    id: "evt-004",
    type: "approval",
    title: "Ready for publish scheduling",
    timestamp: "2026-04-03T09:30:00Z",
    author: "operator-alex",
    detail: "Human approval granted, awaiting publish scheduling.",
    outcome: "Decision recorded",
  },
];
