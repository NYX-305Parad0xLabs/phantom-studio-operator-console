import { describe, expect, it, vi } from "vitest";

import type { IntakeFormValues } from "@/lib/intake/schema";
import { runStageOrder, type RunStageStatus } from "@/lib/runs/status";

const sampleValues: IntakeFormValues = {
  sourceType: "url",
  sourceUrl: "https://example.com/video.mp4",
  uploadReference: "",
  projectName: "Original Creator",
  clipMode: "series_max_3",
  targetPlatforms: ["tiktok"],
  targetLanguages: ["en", "es"],
  styleNotes: "",
  syntheticEnabled: false,
  syntheticDisclosure: "",
  syntheticVoice: "",
};

const mockRunStages = runStageOrder.slice(0, 3).map((stage, index) => {
  const status: RunStageStatus = index === 0 ? "completed" : "pending";
  return {
    stage,
    status,
    startedAt: new Date().toISOString(),
    completedAt: index === 0 ? new Date().toISOString() : undefined,
  };
});

describe("provider gateway intake pipeline", () => {
  it("runs the provider ingestion/transcribe/analysis workflow when live mode is enabled", async () => {
    vi.resetModules();
    const actualConfig = await vi.importActual("@/lib/config");
    const providerSpies = {
      createSource: vi.fn().mockResolvedValue({
        id: 123,
        source_type: "url",
        media_kind: "long_form_video",
        uri: sampleValues.sourceUrl,
        owner_assertion: "Operator console",
        rights_confirmed: true,
      }),
      createIngestJob: vi.fn().mockResolvedValue({
        id: 456,
        source_id: 123,
        current_stage: "ingest",
        ingest_status: "completed",
        transcript_status: "pending",
        clip_analysis_status: "pending",
        caption_status: "pending",
        translation_status: "pending",
        voice_status: "pending",
        lipsync_status: "pending",
        render_status: "pending",
        export_status: "pending",
      }),
      ingestUrl: vi.fn().mockResolvedValue({
        source_id: 123,
        prepared_media: { path: "/mock/ingest.mp4", size_bytes: 1_234_567 },
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
      }),
      ingestUpload: vi.fn().mockResolvedValue({
        source_id: 123,
        prepared_media: { path: "/mock/upload.mp4", size_bytes: 1_234_567 },
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
      }),
      transcribeJob: vi.fn().mockResolvedValue({
        id: 789,
        source_id: 123,
        current_stage: "transcribe",
        ingest_status: "completed",
        transcript_status: "completed",
        clip_analysis_status: "pending",
        caption_status: "pending",
        translation_status: "pending",
        voice_status: "pending",
        lipsync_status: "pending",
        render_status: "pending",
        export_status: "pending",
      }),
      transcribeSource: vi.fn().mockResolvedValue({
        transcript_id: 987,
        text: "Live transcript",
        language: "en",
        confidence: 0.95,
        subtitle_srt_path: "/live.srt",
        segments: [],
        cues: [],
        summary: { overall_confidence: 0.95 },
      }),
      analyzeTranscript: vi.fn().mockResolvedValue({
        analysis_id: 654,
        transcript_id: 987,
        overall_score: 8.1,
        clip_count: 0,
        signals: [],
        clips: [],
        decision_text: "Live analysis",
      }),
    };

    vi.doMock("@/lib/config", () => ({
      ...actualConfig,
      integrationMode: "live",
      providerGatewayBaseUrl: "https://provider.example",
    }));
    vi.doMock("@/lib/api/providerGateway", () => ({
      ProviderGatewayClient: {
        ...providerSpies,
      },
    }));

    const controlPlaneModule = (await vi.importActual("@/lib/api/controlPlane")) as typeof import(
      "@/lib/api/controlPlane"
    );
    const { ControlPlaneClient } = controlPlaneModule;
    vi.spyOn(ControlPlaneClient, "createProject").mockResolvedValue({ id: "proj-1", name: sampleValues.projectName });
    vi.spyOn(ControlPlaneClient, "submitRun").mockResolvedValue({
      id: 1,
      project: sampleValues.projectName,
      status: "queued",
      stage: "character_prepare",
      clipCount: 2,
      sourceType: sampleValues.sourceType,
      platforms: sampleValues.targetPlatforms,
      updatedAt: new Date().toISOString(),
      stages: mockRunStages,
    });

    const { submitIntakeRun } = await import("@/lib/intake/service");

    await submitIntakeRun(sampleValues);

    expect(providerSpies.createSource).toHaveBeenCalled();
    expect(providerSpies.ingestUrl).toHaveBeenCalled();
    expect(providerSpies.transcribeSource).toHaveBeenCalled();
    expect(providerSpies.analyzeTranscript).toHaveBeenCalledWith(987);
  });

  it("skips the provider pipeline when integration mode is mock", async () => {
    vi.resetModules();
    const actualConfig = await vi.importActual("@/lib/config");
    const providerSpies = {
      createSource: vi.fn(),
      createIngestJob: vi.fn(),
      ingestUrl: vi.fn(),
      ingestUpload: vi.fn(),
      transcribeJob: vi.fn(),
      transcribeSource: vi.fn(),
      analyzeTranscript: vi.fn(),
    };

    vi.doMock("@/lib/config", () => ({
      ...actualConfig,
      integrationMode: "mock",
      providerGatewayBaseUrl: "https://provider.example",
    }));
    vi.doMock("@/lib/api/providerGateway", () => ({
      ProviderGatewayClient: {
        ...providerSpies,
      },
    }));

    const controlPlaneModule = (await vi.importActual("@/lib/api/controlPlane")) as typeof import(
      "@/lib/api/controlPlane"
    );
    const { ControlPlaneClient } = controlPlaneModule;
    vi.spyOn(ControlPlaneClient, "createProject").mockResolvedValue({ id: "proj-2", name: sampleValues.projectName });
    vi.spyOn(ControlPlaneClient, "submitRun").mockResolvedValue({
      id: 2,
      project: sampleValues.projectName,
      status: "queued",
      stage: "character_prepare",
      clipCount: 2,
      sourceType: sampleValues.sourceType,
      platforms: sampleValues.targetPlatforms,
      updatedAt: new Date().toISOString(),
      stages: mockRunStages,
    });

    const { submitIntakeRun } = await import("@/lib/intake/service");

    await submitIntakeRun(sampleValues);

    expect(providerSpies.createSource).not.toHaveBeenCalled();
    expect(providerSpies.analyzeTranscript).not.toHaveBeenCalled();
  });
});
