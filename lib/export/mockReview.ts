export type RenderLayer = {
  name: string;
  detail: string;
  status: "complete" | "pending";
};

export type ExportPreset = {
  name: string;
  aspect: string;
  codec: string;
  captionFormats: string[];
  notes: string;
};

export type ExportSuggestion = {
  title: string;
  caption: string;
  hashtags: string[];
};

export type ReadinessState = {
  label: string;
  detail: string;
  state: "ready" | "blocked";
};

export type ExportReviewBundle = {
  videoLabel: string;
  durationLabel: string;
  resolution: string;
  previewText: string;
  layers: RenderLayer[];
  preset: ExportPreset;
  captionFile: {
    name: string;
    status: string;
  };
  captionJson: {
    cues: {
      id: string;
      text: string;
      start: number;
      end: number;
    }[];
    metadata: {
      disclosure: string;
      checksum: string;
    };
  };
  suggestions: ExportSuggestion;
  viralityRationale: string;
  readiness: ReadinessState[];
  statusIndicators: {
    label: string;
    state: "ready" | "blocked";
    detail: string;
  }[];
};

export const mockExportReview: ExportReviewBundle = {
  videoLabel: "Phase One Viral Short",
  durationLabel: "00:15",
  resolution: "1080 × 1920 • 24fps",
  previewText: "Final short wrapped with bold captions + synthetic voiceover",
  layers: [
    { name: "Base clip", detail: "Trimmed from source video", status: "complete" },
    { name: "Caption overlay", detail: "SendShort Bold preset", status: "complete" },
    { name: "Voice-track mix", detail: "Original synthetic voice profile", status: "complete" },
    { name: "Export render", detail: "H.264, 9:16 letterbox", status: "pending" },
  ],
  preset: {
    name: "TikTok / Reels portrait (9:16)",
    aspect: "9:16",
    codec: "H.264",
    captionFormats: ["SRT", "JSON"],
    notes: "Portrait-ready, caption-first frames with logo-safe margins.",
  },
  captionFile: {
    name: "phase-one.captions.srt",
    status: "generated",
  },
  captionJson: {
    cues: [
      { id: "cue-001", text: "We just landed the biggest deal of our lives.", start: 0.2, end: 2.5 },
      { id: "cue-002", text: "Every creator deserves a stage this electric.", start: 2.6, end: 4.3 },
      { id: "cue-003", text: "Stay bold, disclose synthetic frames, and own your story.", start: 4.4, end: 6.7 },
    ],
    metadata: {
      disclosure: "Original synthetic character disclosed 2026-04-03",
      checksum: "sha256:2e3f6b8a7c8f1e0d8c1a6c5b4d3e2f1a0b9c8d7f6e5c4b3a2f1e0d9c8b7a6f5",
    },
  },
  suggestions: {
    title: "Phase One: Bold Synthetic Reveal",
    caption: "Biggest deal energy, synthetic creator disclosure, viral call-to-action.",
    hashtags: ["#phaseshort", "#originalsynthetic", "#viralsafe"],
  },
  viralityRationale:
    "Hook in first 3 seconds, high-energy payoff, narration mentions new milestone, captions highlight disclosure.",
  readiness: [
    { label: "Approval state", detail: "Human review approved captions + QA", state: "ready" },
    { label: "Disclosure state", detail: "Synthetic persona marked and disclosed", state: "ready" },
    { label: "Export bundle state", detail: "Manifest emitted, checksum recorded", state: "ready" },
    { label: "Policy state", detail: "No banned keywords or impersonation signals", state: "ready" },
  ],
  statusIndicators: [
    { label: "Ready for human approval", state: "ready", detail: "QA and captions green" },
    { label: "Blocked pending review", state: "blocked", detail: "Alternate review flow requires human sign-off" },
    { label: "Blocked pending export issue", state: "blocked", detail: "Render still finishing; wait for checksum" },
  ],
};
