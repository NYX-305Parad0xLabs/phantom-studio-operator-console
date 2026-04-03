"use client";

import { providerGatewayBaseUrl, providerAuthToken, integrationMode } from "@/lib/config";
import { mockClipCandidates } from "@/lib/review/clip";

const shouldUseLiveProvider = Boolean(providerGatewayBaseUrl && integrationMode === "live");

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${providerGatewayBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerAuthToken}`,
    },
    body: options.body,
  });
  if (!response.ok) {
    throw new Error(`Provider gateway request failed at ${path}`);
  }
  return response.json() as Promise<T>;
}

type MediaSourceCreatePayload = {
  sourceType: "url" | "upload";
  mediaKind: "long_form_video" | "short_form_video" | "audio";
  uri: string;
  ownerAssertion: string;
  rightsConfirmed: boolean;
  syntheticCharacterName?: string;
  syntheticDisclosureLabel?: string;
};

export type MediaSourceRead = {
  id: number;
  source_type: "url" | "upload" | "synthetic";
  media_kind: "long_form_video" | "short_form_video" | "audio";
  uri: string;
  owner_assertion: string;
  rights_confirmed: boolean;
  synthetic_character_name?: string | null;
  synthetic_disclosure_label?: string | null;
};

export type WorkflowJobRead = {
  id: number;
  source_id: number;
  current_stage: string;
  ingest_status: string;
  transcript_status: string;
  clip_analysis_status: string;
  caption_status: string;
  translation_status: string;
  voice_status: string;
  lipsync_status: string;
  render_status: string;
  export_status: string;
};

export type PreparedMediaRead = {
  path: string;
  size_bytes: number;
};

export type MediaMetadataRead = {
  duration_seconds: number;
  width: number;
  height: number;
  fps: number;
  aspect_ratio: string;
  has_audio: boolean;
  container: string;
  codec: string;
};

export type IngestManifestRead = {
  manifest_path: string;
  provider: string;
  artifact_id: string;
  metadata: MediaMetadataRead;
};

export type IngestResponse = {
  source_id: number;
  prepared_media: PreparedMediaRead;
  manifest: IngestManifestRead;
};

export type TranscriptionDetail = {
  transcript_id: number;
  text: string;
  language: string;
  confidence: number;
  subtitle_srt_path: string;
  segments: {
    start_seconds: number;
    end_seconds: number;
    text: string;
    confidence: number;
    words: { text: string; start_seconds: number; end_seconds: number }[];
  }[];
  cues: { cue_index: number; start_seconds: number; end_seconds: number; text: string }[];
  summary: { overall_confidence: number };
};

export type ClipCandidateRead = {
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  score: number;
  rationale: string;
  best_clip: boolean;
};

export type ViralSignalRead = {
  signal_type: string;
  value: number;
  description: string;
};

export type ViralAnalysisRead = {
  analysis_id: number;
  transcript_id: number;
  overall_score: number;
  clip_count: number;
  signals: ViralSignalRead[];
  clips: ClipCandidateRead[];
  decision_text: string;
};

export type ClipSelectionRequest = {
  source_reference: string;
  mode?: "single_best" | "series";
  target_languages?: string[];
  platform_hint?: string;
  style_notes?: string;
  duration_min_seconds?: number;
  duration_max_seconds?: number;
  max_clips?: number;
};

export type ClipArtifactRead = {
  clip_id: number;
  clip_path: string;
  duration_seconds: number;
  start_seconds: number;
  end_seconds: number;
  transcript_segment_id: number | null;
  best_clip: boolean;
  platform_hint: string | null;
  style_notes: string | null;
};

const mockSource: MediaSourceRead = {
  id: 1,
  source_type: "url",
  media_kind: "long_form_video",
  uri: "https://example.com/mock.mp4",
  owner_assertion: "Mock owner",
  rights_confirmed: true,
  synthetic_character_name: null,
  synthetic_disclosure_label: null,
};

const mockJob: WorkflowJobRead = {
  id: 1,
  source_id: mockSource.id,
  current_stage: "select_clip",
  ingest_status: "completed",
  transcript_status: "completed",
  clip_analysis_status: "complete",
  caption_status: "pending",
  translation_status: "pending",
  voice_status: "pending",
  lipsync_status: "pending",
  render_status: "pending",
  export_status: "pending",
};

const mockTranscription: TranscriptionDetail = {
  transcript_id: 1,
  text: "We just closed the deal.",
  language: "en",
  confidence: 0.92,
  subtitle_srt_path: "/mock/transcript.srt",
  segments: [
    {
      start_seconds: 0,
      end_seconds: 5,
      text: "We just closed the deal.",
      confidence: 0.93,
      words: [
        { text: "We", start_seconds: 0, end_seconds: 0.5 },
        { text: "just", start_seconds: 0.5, end_seconds: 1 },
      ],
    },
  ],
  cues: [
    { cue_index: 1, start_seconds: 0, end_seconds: 5, text: "We just closed the deal." },
  ],
  summary: { overall_confidence: 0.92 },
};

const mockAnalysis: ViralAnalysisRead = {
  analysis_id: 1,
  transcript_id: mockTranscription.transcript_id,
  overall_score: 8.2,
  clip_count: mockClipCandidates.length,
  signals: [
    { signal_type: "hook_density", value: 3.2, description: "High hook per second" },
    { signal_type: "energy", value: 2.1, description: "High speaking energy" },
  ],
  clips: mockClipCandidates.map((candidate) => ({
    start_seconds: candidate.startSeconds,
    end_seconds: candidate.endSeconds,
    duration_seconds: candidate.durationSeconds,
    score: candidate.score,
    rationale: candidate.rationale,
    best_clip: candidate.bestClip,
  })),
  decision_text: "Use the best clip for hero shot",
};

const mockClipArtifact: ClipArtifactRead = {
  clip_id: 101,
  clip_path: "/mock/clip.mp4",
  duration_seconds: 8,
  start_seconds: 2,
  end_seconds: 10,
  transcript_segment_id: 1,
  best_clip: true,
  platform_hint: "tiktok",
  style_notes: "Mock style notes",
};

function liveOrMock<T>(live: () => Promise<T>, fallback: T): Promise<T> {
  if (!shouldUseLiveProvider) {
    return Promise.resolve(fallback);
  }
  return live();
}

export const ProviderGatewayClient = {
  async createSource(payload: MediaSourceCreatePayload): Promise<MediaSourceRead> {
    return liveOrMock(
      () =>
        request<MediaSourceRead>("/api/sources", {
          method: "POST",
          body: JSON.stringify({
            source_type: payload.sourceType,
            media_kind: payload.mediaKind,
            uri: payload.uri,
            owner_assertion: payload.ownerAssertion,
            rights_confirmed: payload.rightsConfirmed,
            synthetic_character_name: payload.syntheticCharacterName,
            synthetic_disclosure_label: payload.syntheticDisclosureLabel,
          }),
        }),
      mockSource,
    );
  },

  async createIngestJob(sourceId: number): Promise<WorkflowJobRead> {
    return liveOrMock(
      () =>
        request<WorkflowJobRead>("/api/jobs/ingest", {
          method: "POST",
          body: JSON.stringify({ source_id: sourceId }),
        }),
      mockJob,
    );
  },

  async ingestUrl(payload: {
    sourceId: number;
    rightsConfirmed: boolean;
    url: string;
    targetFormat?: string;
  }): Promise<IngestResponse> {
    return liveOrMock(
      () =>
        request<IngestResponse>("/api/jobs/ingest/url", {
          method: "POST",
          body: JSON.stringify({
            source_id: payload.sourceId,
            rights_confirmed: payload.rightsConfirmed,
            url: payload.url,
            ...(payload.targetFormat ? { target_format: payload.targetFormat } : {}),
          }),
        }),
      {
        source_id: payload.sourceId,
        prepared_media: mockTranscription.segments.length
          ? { path: "/mock/prepared.mp4", size_bytes: 1_024_000 }
          : { path: "/mock/prepared.mp4", size_bytes: 1_024_000 },
        manifest: {
          manifest_path: "/mock/manifest.json",
          provider: "mock-provider",
          artifact_id: "artifact-001",
          metadata: {
            duration_seconds: 30,
            width: 1920,
            height: 1080,
            fps: 30,
            aspect_ratio: "16:9",
            has_audio: true,
            container: "mp4",
            codec: "h264",
          },
        },
      },
    );
  },

  async ingestUpload(payload: {
    sourceId: number;
    rightsConfirmed: boolean;
    filename: string;
  }): Promise<IngestResponse> {
    return liveOrMock(
      () =>
        request<IngestResponse>("/api/jobs/ingest/upload", {
          method: "POST",
          body: JSON.stringify({
            source_id: payload.sourceId,
            rights_confirmed: payload.rightsConfirmed,
            filename: payload.filename,
          }),
        }),
      {
        source_id: payload.sourceId,
        prepared_media: { path: "/mock/prepared-upload.mp4", size_bytes: 1_024_000 },
        manifest: {
          manifest_path: "/mock/upload-manifest.json",
          provider: "mock-provider",
          artifact_id: "artifact-upload",
          metadata: {
            duration_seconds: 30,
            width: 1920,
            height: 1080,
            fps: 30,
            aspect_ratio: "16:9",
            has_audio: true,
            container: "mp4",
            codec: "h264",
          },
        },
      },
    );
  },

  async transcribeJob(jobId: number): Promise<WorkflowJobRead> {
    return liveOrMock(
      () =>
        request<WorkflowJobRead>("/api/jobs/transcribe", {
          method: "POST",
          body: JSON.stringify({ job_id: jobId }),
        }),
      mockJob,
    );
  },

  async transcribeSource(sourceId: number, payload: { rightsConfirmed: boolean; language?: string }) {
    return liveOrMock(
      () =>
        request<TranscriptionDetail>(`/api/jobs/transcribe/${sourceId}`, {
          method: "POST",
          body: JSON.stringify({
            rights_confirmed: payload.rightsConfirmed,
            language: payload.language,
          }),
        }),
      mockTranscription,
    );
  },

  async analyzeTranscript(transcriptId: number): Promise<ViralAnalysisRead> {
    return liveOrMock(
      () => request<ViralAnalysisRead>(`/api/jobs/analyze/${transcriptId}`, { method: "POST" }),
      mockAnalysis,
    );
  },

  async fetchAnalysis(analysisId: number): Promise<ViralAnalysisRead> {
    return liveOrMock(
      () => request<ViralAnalysisRead>(`/api/analyses/${analysisId}`),
      mockAnalysis,
    );
  },

  async fetchTranscript(transcriptId: number): Promise<TranscriptionDetail> {
    return liveOrMock(
      () => request<TranscriptionDetail>(`/api/transcripts/${transcriptId}`),
      mockTranscription,
    );
  },

  async fetchClip(clipId: number): Promise<ClipArtifactRead> {
    return liveOrMock(
      () => request<ClipArtifactRead>(`/api/clips/${clipId}`),
      mockClipArtifact,
    );
  },
};
