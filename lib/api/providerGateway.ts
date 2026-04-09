"use client";

import { providerGatewayBaseUrl, providerAuthToken, integrationMode } from "@/lib/config";
import { mockClipCandidates } from "@/lib/review/clip";
import { mockVoiceArtifact, mockLipsyncArtifact } from "@/lib/provider/mockVoice";
import { mockRenderSummary } from "@/lib/export/mockRender";
import type {
  LipSyncArtifactRead,
  VoiceArtifactRead,
} from "@/lib/provider/types";

export type { LipSyncArtifactRead, VoiceArtifactRead } from "@/lib/provider/types";
import { mockCaptionArtifact, type CaptionCue } from "@/lib/review/caption";

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

export type CaptionEmphasisMarkerRead = {
  marker_type: string;
  value: string;
  detail: string | null;
};

export type CaptionCueRead = {
  cue_index: number;
  start_seconds: number;
  end_seconds: number;
  text: string;
  transcript_segment_id: number | null;
  transcript_reference: string;
  emoji_suggestions: string[];
  punch_words: string[];
  zoom_suggestion: string | null;
  b_roll_suggestion: string | null;
  emphasis_markers: CaptionEmphasisMarkerRead[];
};

export type CaptionStyleSpecRead = {
  name: string;
  description: string | null;
  text_color: string;
  background_color: string;
  accent_color: string;
  font_weight: string;
  emphasis_style: string;
  visibility_window_seconds: number;
};

export type CaptionPlanRead = {
  caption_id: number;
  clip_id: number;
  style: CaptionStyleSpecRead;
  cue_count: number;
  caption_json_path: string;
  srt_like_path: string | null;
  cues: CaptionCueRead[];
  platform_hint: string | null;
  context_note: string | null;
};

export type TranslationCueRead = {
  cue_index: number;
  start_seconds: number;
  end_seconds: number;
  translated_text: string;
  transcript_reference: string;
};

export type TranslationQualityNoteRead = {
  category: string;
  detail: string;
  confidence_score: number | null;
};

export type TranslationDetailRead = {
  translation_id: number;
  caption_plan_id: number;
  target_language_code: string;
  target_label: string | null;
  translation_json_path: string;
  subtitle_path: string | null;
  cue_count: number;
  cues: TranslationCueRead[];
  quality_notes: TranslationQualityNoteRead[];
};

export type TranslationBatchRead = {
  caption_id: number;
  translations: TranslationDetailRead[];
};

export type PlatformExportSpecRead = {
  id: number;
  name: string;
  target_platform: string;
  orientation: string;
  resolution: string;
  aspect_ratio: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

export type RenderLayerRead = {
  layer_type: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

export type RenderPlanRead = {
  id: number;
  clip_id: number;
  caption_plan_id: number;
  translation_ids: number[] | null;
  voice_artifact_id: number | null;
  lipsync_result_id: number | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

export type RenderOutputRead = {
  id: number;
  render_plan_id: number;
  video_uri: string;
  caption_text_path: string;
  caption_json_path: string;
  duration_seconds: number;
  spec_id: number | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  spec: PlatformExportSpecRead | null;
};

export type PublishReadyPayloadRead = {
  id: number;
  render_output_id: number;
  title: string;
  caption: string;
  hashtags: string[] | null;
  rationale: string | null;
  spec_id: number;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

export type RenderSummaryRead = {
  plan: RenderPlanRead;
  layers: RenderLayerRead[];
  output: RenderOutputRead;
  spec: PlatformExportSpecRead | null;
  publish_ready: PublishReadyPayloadRead | null;
};

export type MultiShotSceneRequest = {
  shot_id: string;
  duration_seconds: number;
  prompt: string;
  start_frame_reference?: string | null;
  end_frame_reference?: string | null;
};

export type MultiShotVideoRequest = {
  workflowRunId: number;
  influencerLockId: string;
  productName: string;
  videoBackend: string;
  targetPlatforms: string[];
  referenceImageUrl?: string;
  scenes: MultiShotSceneRequest[];
};

export type MultiShotSceneResult = {
  shot_id: string;
  video_uri: string;
  duration_seconds: number;
  backend: string;
  request_payload: Record<string, unknown>;
};

export type MultiShotVideoResponse = {
  workflow_run_id: number;
  influencer_lock_id: string;
  product_name: string;
  backend: string;
  stitched_video_uri: string;
  metadata_uri?: string | null;
  video_uri: string;
  total_duration_seconds: number;
  disclosure_text?: string;
  provenance?: Record<string, unknown>;
  scenes: MultiShotSceneResult[];
};

export type MultiShotJobCreateResponse = {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  message: string;
};

export type MultiShotJobStatusResponse = {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  message: string;
  progress_percent: number;
  current_scene?: number | null;
  total_scenes?: number | null;
  result?: MultiShotVideoResponse | null;
  error?: string | null;
};

export type ReferenceImageUploadResponse = {
  reference_image_url: string;
  filename: string;
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

const mockCaptionCueReads: CaptionCueRead[] = mockCaptionArtifact.cues.map(
  (cue: CaptionCue, index: number) => ({
    cue_index: index + 1,
    start_seconds: cue.startSeconds,
    end_seconds: cue.endSeconds,
    text: cue.text,
    transcript_segment_id: null,
    transcript_reference: `segment-${index + 1}`,
    emoji_suggestions: cue.emojiSuggestions,
    punch_words: cue.emphasisWords,
    zoom_suggestion: null,
    b_roll_suggestion: null,
    emphasis_markers: [],
  }),
);

const mockCaptionStyle: CaptionStyleSpecRead = {
  name: mockCaptionArtifact.stylePreset.name,
  description: mockCaptionArtifact.stylePreset.description,
  text_color: "#FFFFFF",
  background_color: "#000000",
  accent_color: "#FFD700",
  font_weight: "bold",
  emphasis_style: "underline",
  visibility_window_seconds: 2.5,
};

const mockCaptionPlan: CaptionPlanRead = {
  caption_id: 1,
  clip_id: mockClipArtifact.clip_id,
  style: mockCaptionStyle,
  cue_count: mockCaptionCueReads.length,
  caption_json_path: "/mock/caption-plan.json",
  srt_like_path: "/mock/caption-plan.srt",
  cues: mockCaptionCueReads,
  platform_hint: mockClipArtifact.platform_hint,
  context_note: "Mock caption plan generated for review",
};

const mockTranslationBatch: TranslationBatchRead = {
  caption_id: mockCaptionPlan.caption_id,
  translations: [
    {
      translation_id: 11,
      caption_plan_id: mockCaptionPlan.caption_id,
      target_language_code: "es-ES",
      target_label: "Spanish",
      translation_json_path: "/mock/translation-spanish.json",
      subtitle_path: "/mock/translation-spanish.srt",
      cue_count: mockCaptionPlan.cue_count,
      cues: mockCaptionCueReads.map((cue) => ({
        cue_index: cue.cue_index,
        start_seconds: cue.start_seconds,
        end_seconds: cue.end_seconds,
        translated_text: `Live Spanish cue ${cue.cue_index}`,
        transcript_reference: cue.transcript_reference,
      })),
      quality_notes: [
        {
          category: "placeholder",
          detail: "Sentence structures shortened for scrolling attention.",
          confidence_score: 0.7,
        },
      ],
    },
    {
      translation_id: 12,
      caption_plan_id: mockCaptionPlan.caption_id,
      target_language_code: "fr-FR",
      target_label: "French",
      translation_json_path: "/mock/translation-french.json",
      subtitle_path: "/mock/translation-french.srt",
      cue_count: mockCaptionPlan.cue_count,
      cues: mockCaptionCueReads.map((cue) => ({
        cue_index: cue.cue_index,
        start_seconds: cue.start_seconds,
        end_seconds: cue.end_seconds,
        translated_text: `Live French cue ${cue.cue_index}`,
        transcript_reference: cue.transcript_reference,
      })),
      quality_notes: [
        {
          category: "placeholder",
          detail: "Tone stays bold with simplified adjectives.",
          confidence_score: 0.65,
        },
      ],
    },
  ],
};

const mockMultiShotResponse: MultiShotVideoResponse = {
  workflow_run_id: 1,
  influencer_lock_id: "influencer-lock-mock",
  product_name: "Mock Product",
  backend: "kling",
  stitched_video_uri: "file://renders/run-1/mock-product-kling-stitched.mp4",
  metadata_uri: "file://renders/run-1/mock-product-kling-stitched.json",
  video_uri: "file://renders/run-1/mock-product-kling-stitched.mp4",
  total_duration_seconds: 22,
  disclosure_text: "This is AI-generated synthetic content.",
  scenes: [
    {
      shot_id: "shot-1-hook",
      video_uri: "https://kling.mock/run/1/lock/influencer-lock-mock/mock-product/shot-1-hook.mp4",
      duration_seconds: 5,
      backend: "kling",
      request_payload: { prompt: "Mock hook scene" },
    },
  ],
};

function liveOrMock<T>(live: () => Promise<T>, fallback: T): Promise<T> {
  if (!shouldUseLiveProvider) {
    return Promise.resolve(fallback);
  }
  return live();
}

export const ProviderGatewayClient = {
  async uploadReferenceImage(file: File): Promise<ReferenceImageUploadResponse> {
    if (!shouldUseLiveProvider) {
      return {
        reference_image_url: "https://example.com/mock-reference.png",
        filename: file.name,
      };
    }
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${providerGatewayBaseUrl}/api/video/reference-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerAuthToken}`,
      },
      body: form,
    });
    if (!response.ok) {
      throw new Error("Reference image upload failed");
    }
    return response.json() as Promise<ReferenceImageUploadResponse>;
  },

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

  async fetchCaptionPlan(captionId: number): Promise<CaptionPlanRead> {
    if (!captionId) {
      return Promise.resolve(mockCaptionPlan);
    }
    return liveOrMock(
      () => request<CaptionPlanRead>(`/api/captions/${captionId}`),
      mockCaptionPlan,
    );
  },

  async requestTranslationBatch(
    captionId: number,
    payload: { targetLanguages?: string[]; includeSrt?: boolean; contextNote?: string },
  ): Promise<TranslationBatchRead> {
    if (!captionId) {
      return Promise.resolve(mockTranslationBatch);
    }
    return liveOrMock(
      () =>
        request<TranslationBatchRead>(`/api/jobs/translate/${captionId}`, {
          method: "POST",
          body: JSON.stringify({
            target_languages: payload.targetLanguages,
            include_srt: payload.includeSrt ?? true,
            context_note: payload.contextNote,
          }),
        }),
      mockTranslationBatch,
    );
  },

  async fetchTranslation(translationId: number): Promise<TranslationDetailRead> {
    return liveOrMock(
      () => request<TranslationDetailRead>(`/api/translations/${translationId}`),
      mockTranslationBatch.translations[0],
    );
  },

  async fetchVoiceArtifact(voiceId: number): Promise<VoiceArtifactRead> {
    if (!voiceId) {
      return Promise.resolve(mockVoiceArtifact);
    }
    return liveOrMock(
      () => request<VoiceArtifactRead>(`/api/voices/${voiceId}`),
      mockVoiceArtifact,
    );
  },

  async fetchLipSyncArtifact(lipsyncId: number): Promise<LipSyncArtifactRead> {
    if (!lipsyncId) {
      return Promise.resolve(mockLipsyncArtifact);
    }
    return liveOrMock(
      () => request<LipSyncArtifactRead>(`/api/lipsync/${lipsyncId}`),
      mockLipsyncArtifact,
    );
  },

  async fetchRenderSummary(renderId: number): Promise<RenderSummaryRead> {
    if (!renderId) {
      return Promise.resolve(mockRenderSummary);
    }
    return liveOrMock(
      () => request<RenderSummaryRead>(`/api/renders/${renderId}`),
      mockRenderSummary,
    );
  },

  async generateMultiShotVideo(payload: MultiShotVideoRequest): Promise<MultiShotVideoResponse> {
    return liveOrMock(
      () =>
        request<MultiShotVideoResponse>("/api/video/multi-shot", {
          method: "POST",
          body: JSON.stringify({
            workflowRunId: payload.workflowRunId,
            influencerLockId: payload.influencerLockId,
            productName: payload.productName,
            videoBackend: payload.videoBackend,
            targetPlatforms: payload.targetPlatforms,
            referenceImageUrl: payload.referenceImageUrl,
            scenes: payload.scenes,
          }),
        }),
      {
        ...mockMultiShotResponse,
        workflow_run_id: payload.workflowRunId,
        influencer_lock_id: payload.influencerLockId,
        product_name: payload.productName,
        backend: payload.videoBackend,
        video_uri: `https://${payload.videoBackend}.mock/run/${payload.workflowRunId}/stitched.mp4`,
        stitched_video_uri: `https://${payload.videoBackend}.mock/run/${payload.workflowRunId}/stitched.mp4`,
        metadata_uri: `https://${payload.videoBackend}.mock/run/${payload.workflowRunId}/stitched.json`,
        scenes: payload.scenes.map((scene) => ({
          shot_id: scene.shot_id,
          video_uri: `https://${payload.videoBackend}.mock/run/${payload.workflowRunId}/${scene.shot_id}.mp4`,
          duration_seconds: scene.duration_seconds,
          backend: payload.videoBackend,
          request_payload: {
            prompt: scene.prompt,
            start_frame_reference: scene.start_frame_reference ?? null,
            end_frame_reference: scene.end_frame_reference ?? null,
          },
        })),
      },
    );
  },

  async createMultiShotJob(payload: MultiShotVideoRequest): Promise<MultiShotJobCreateResponse> {
    if (!shouldUseLiveProvider) {
      return { job_id: `mock-job-${Date.now()}`, status: "queued", message: "Queued..." };
    }
    return request<MultiShotJobCreateResponse>("/api/video/multi-shot/jobs", {
      method: "POST",
      body: JSON.stringify({
        workflowRunId: payload.workflowRunId,
        influencerLockId: payload.influencerLockId,
        productName: payload.productName,
        videoBackend: payload.videoBackend,
        targetPlatforms: payload.targetPlatforms,
        referenceImageUrl: payload.referenceImageUrl,
        scenes: payload.scenes,
      }),
    });
  },

  async getMultiShotJob(jobId: string): Promise<MultiShotJobStatusResponse> {
    if (!shouldUseLiveProvider) {
      return {
        job_id: jobId,
        status: "completed",
        message: "Completed",
        progress_percent: 100,
        current_scene: 4,
        total_scenes: 4,
        result: {
          ...mockMultiShotResponse,
          stitched_video_uri: `https://mock.local/${jobId}.mp4`,
          metadata_uri: `https://mock.local/${jobId}.json`,
        },
      };
    }
    return request<MultiShotJobStatusResponse>(`/api/video/multi-shot/jobs/${jobId}`);
  },
};

export const providerGateway = {
  generateMultiShot: (payload: MultiShotVideoRequest) =>
    ProviderGatewayClient.generateMultiShotVideo(payload),
};
