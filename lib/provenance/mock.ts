export type ProviderTrace = {
  id: string;
  stage: string;
  provider: string;
  model: string;
  requestMeta: string;
  responseMeta: string;
  promptSummary: string;
  sourceAssets: string[];
  generatedAssets: string[];
  timestamp: string;
  operator: string;
};

export type PromptArtifact = {
  id: string;
  stage: string;
  prompt: string;
  tokens: number;
  confidence: string;
};

export type AssetReference = {
  id: string;
  label: string;
  path: string;
  checksum: string;
};

export type AuditEvent = {
  id: string;
  type: string;
  timestamp: string;
  actor: string;
  detail: string;
};

export type ExportManifest = {
  id: string;
  path: string;
  checksum: string;
  disclosure: string;
  reviewTrail: string[];
};

export const mockProviderTraces: ProviderTrace[] = [
  {
    id: "trace-001",
    stage: "image_gen",
    provider: "Flux",
    model: "flux-v2.1",
    requestMeta: "prompt template v4, 4 shots, disclosure tag included",
    responseMeta: "5 assets returned, 1 selected",
    promptSummary: "Original synth hero wearing neon gear",
    sourceAssets: ["source-frame-001.mp4"],
    generatedAssets: ["image-hero-004.png"],
    timestamp: "2026-04-03T09:00:00Z",
    operator: "operator-alex",
  },
  {
    id: "trace-002",
    stage: "voice",
    provider: "ElevenLike",
    model: "studio-voice-latin",
    requestMeta: "Script chunk with disclosure mention",
    responseMeta: "1 WAV file, 24kHz stereo",
    promptSummary: "Synthetic narration affirming disclosure",
    sourceAssets: ["script-1234.txt"],
    generatedAssets: ["voice-synth-001.wav"],
    timestamp: "2026-04-03T09:05:00Z",
    operator: "operator-sam",
  },
];

export const mockPromptArtifacts: PromptArtifact[] = [
  {
    id: "prompt-001",
    stage: "image_gen",
    prompt: "Create bold synthetic hero, mention disclosure, focus on energy.",
    tokens: 176,
    confidence: "0.82",
  },
  {
    id: "prompt-002",
    stage: "voice",
    prompt: "Narrate: disclose synthetic creation and invite community.",
    tokens: 89,
    confidence: "0.91",
  },
];

export const mockAssetReferences: AssetReference[] = [
  {
    id: "asset-src-001",
    label: "Original footage",
    path: "data/src/phase-one.mp4",
    checksum: "sha256:abc123...",
  },
  {
    id: "asset-generated-image",
    label: "Selected hero image",
    path: "data/derived/image-hero-004.png",
    checksum: "sha256:def456...",
  },
  {
    id: "asset-generated-voice",
    label: "Synthetic voice WAV",
    path: "data/derived/voice-synth-001.wav",
    checksum: "sha256:ghi789...",
  },
];

export const mockAuditEvents: AuditEvent[] = [
  {
    id: "event-001",
    type: "ingest",
    timestamp: "2026-04-03T08:55:00Z",
    actor: "system",
    detail: "Ingest job recorded, file hash logged.",
  },
  {
    id: "event-002",
    type: "review",
    timestamp: "2026-04-03T09:15:00Z",
    actor: "operator-alex",
    detail: "Caption + voice review approved.",
  },
  {
    id: "event-003",
    type: "publish",
    timestamp: "2026-04-03T09:20:00Z",
    actor: "operator-alex",
    detail: "Export bundle flagged ready for scheduling.",
  },
];

export const mockExportManifest: ExportManifest = {
  id: "bundle-001",
  path: "exports/run-123/bundle.json",
  checksum: "sha256:bundlecheckxyz",
  disclosure: "Original synthetic character disclosed 2026-04-03",
  reviewTrail: ["caption review approved", "voice review signed off", "approval decision logged"],
};
