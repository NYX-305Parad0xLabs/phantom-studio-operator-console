export type ClipCandidate = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  score: number;
  rationale: string;
  transcriptExcerpt: string;
  bestClip: boolean;
  platformHint: string;
  styleNotes: string;
};

export const mockClipCandidates: ClipCandidate[] = [
  {
    id: "clip-001",
    startSeconds: 3,
    endSeconds: 11,
    durationSeconds: 8,
    score: 8.4,
    rationale: "Strong hook + surprise payoff; early emotional peak.",
    transcriptExcerpt: "“We just landed the biggest deal of our lives.”",
    bestClip: true,
    platformHint: "tiktok",
    styleNotes: "urgent voice, bold captions",
  },
  {
    id: "clip-002",
    startSeconds: 22,
    endSeconds: 32,
    durationSeconds: 10,
    score: 7.2,
    rationale: "Series candidate with clear hook → payoff structure.",
    transcriptExcerpt: "“If you doubted crypto, this ripple effect is for you.”",
    bestClip: false,
    platformHint: "instagram",
    styleNotes: "friendly callout, emoji suggestion",
  },
  {
    id: "clip-003",
    startSeconds: 45,
    endSeconds: 58,
    durationSeconds: 13,
    score: 6.8,
    rationale: "Strong closing statement for multi-clip story.",
    transcriptExcerpt: "“This is how we rewrite the playbook for creator fans.”",
    bestClip: false,
    platformHint: "x",
    styleNotes: "concert cut, include subtitles",
  },
];
