import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ReviewPage from "@/app/review/page";
import { Providers } from "@/app/providers";
import { ControlPlaneClient, mockRun } from "@/lib/api/controlPlane";

describe("ReviewPage", () => {
  it("renders clip list and preview headings", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText("Clip Review")).toBeInTheDocument();
    expect(screen.getByText("Candidates")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("shows mock write indicator", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );
    expect(screen.getByText(/Mock writes/i)).toBeInTheDocument();
  });

  it("allows toggling compare mode and selecting candidate", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    const compareButton = screen.getByRole("button", { name: "Compare" });
    fireEvent.click(compareButton);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it("shows transcript excerpt", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText(/Strong hook/i)).toBeInTheDocument();
  });

  it("displays caption cues and flag actions", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText(/Emojis: 🔥 🚀/i)).toBeInTheDocument();
    const flagButtons = screen.getAllByRole("button", {
      name: /Flag cue for rewrite/i,
    });
    expect(flagButtons.length).toBeGreaterThan(0);
  });

    it("shows caption and translation mode badges when mocks are active", () => {
      render(
        <Providers>
          <ReviewPage />
        </Providers>,
      );

      expect(screen.getByText(/Mock captions/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock translations/i)).toBeInTheDocument();
    });

    it("shows mock voice and lip-sync badges when live mode is disabled", () => {
      render(
        <Providers>
          <ReviewPage />
        </Providers>,
      );

      expect(screen.getByText(/Mock voice/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock lip-sync/i)).toBeInTheDocument();
    });

  it("switches translation tabs and shows localized cues", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Spanish" }));
    expect(screen.getByText(/Acabamos de cerrar/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "French" }));
    expect(screen.getByText(/Nous venons de conclure/i)).toBeInTheDocument();
  });

  it("approves captions and highlights diff", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    const approveButton = screen.getByRole("button", { name: /Approve captions/i });
    fireEvent.click(approveButton);

    expect(screen.getByRole("button", { name: /Captions approved/i })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Flag cue for rewrite/i })[0]);
    expect(screen.getByText(/Flagged cue-001 for rewrite/)).toBeInTheDocument();
  });

  it("submits an approval decision", async () => {
    const spy = vi
      .spyOn(ControlPlaneClient, "approveRun")
      .mockResolvedValue(mockRun);

    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    const submitButton = screen.getByRole("button", { name: /Submit decision/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/approve recorded/i)).toBeInTheDocument();
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it("renders run history entries", () => {
    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(screen.getByText(/Run history/)).toBeInTheDocument();
    expect(screen.getByText(/Automated QA pass/)).toBeInTheDocument();
    expect(screen.getByText(/Ready for publish scheduling/)).toBeInTheDocument();
  });

  it("renders provider clip candidates and translation cues when live mode is enabled", async () => {
    vi.resetModules();
    const actualConfig = await vi.importActual("@/lib/config");
    vi.doMock("@/lib/config", () => ({
      ...actualConfig,
      providerGatewayBaseUrl: "https://provider.example",
      integrationMode: "live",
      defaultProviderAnalysisId: 99,
      defaultProviderTranscriptId: 42,
      defaultProviderCaptionId: 77,
      providerTranslationTargets: ["es", "fr"],
      defaultProviderVoiceId: 501,
      defaultProviderLipsyncId: 601,
    }));

    const mockAnalysis = {
      analysis_id: 99,
      transcript_id: 42,
      overall_score: 9.1,
      clip_count: 2,
      clips: [
        {
          start_seconds: 1,
          end_seconds: 5,
          duration_seconds: 4,
          score: 8.7,
          rationale: "Live analysis rationale",
          best_clip: true,
        },
      ],
      signals: [{ signal_type: "hook_density", value: 3.0, description: "Live hook" }],
      decision_text: "Choose the hero clip",
    };
    const mockTranscript = {
      transcript_id: 42,
      text: "Live transcript",
      language: "en",
      confidence: 0.95,
      subtitle_srt_path: "/live.srt",
      segments: [
        {
          start_seconds: 0,
          end_seconds: 6,
          text: "We just closed a live deal.",
          confidence: 0.95,
          words: [{ text: "We", start_seconds: 0, end_seconds: 0.5 }],
        },
      ],
      cues: [
        { cue_index: 1, start_seconds: 0, end_seconds: 5, text: "Live transcript" },
      ],
      summary: { overall_confidence: 0.95 },
    };

    const mockCaptionPlan = {
      caption_id: 77,
      clip_id: 101,
      style: {
        name: "sendshort_like",
        description: "Live caption style",
        text_color: "#FFFFFF",
        background_color: "#000000",
        accent_color: "#00FF00",
        font_weight: "bold",
        emphasis_style: "underline",
        visibility_window_seconds: 2.4,
      },
      cue_count: 1,
      caption_json_path: "/live/caption-plan.json",
      srt_like_path: "/live/caption-plan.srt",
      cues: [
        {
          cue_index: 1,
          start_seconds: 0.2,
          end_seconds: 2.5,
          text: "Live caption cue",
          transcript_segment_id: null,
          transcript_reference: "segment-1",
          emoji_suggestions: ["🔥"],
          punch_words: ["live"],
          zoom_suggestion: null,
          b_roll_suggestion: null,
          emphasis_markers: [],
        },
      ],
      platform_hint: "tiktok",
      context_note: "Live caption overlay",
    };

    const mockTranslationBatch = {
      caption_id: 77,
      translations: [
        {
          translation_id: 201,
          caption_plan_id: 77,
          target_language_code: "es-ES",
          target_label: "Spanish",
          translation_json_path: "/live/translation-es.json",
          subtitle_path: "/live/translation-es.srt",
          cue_count: 1,
          cues: [
            {
              cue_index: 1,
              start_seconds: 0.2,
              end_seconds: 2.5,
              translated_text: "Spanish live cue",
              transcript_reference: "segment-1",
            },
          ],
          quality_notes: [
            {
              category: "placeholder",
              detail: "Live Spanish note",
              confidence_score: 0.5,
            },
          ],
        },
        {
          translation_id: 202,
          caption_plan_id: 77,
          target_language_code: "fr-FR",
          target_label: "French",
          translation_json_path: "/live/translation-fr.json",
          subtitle_path: "/live/translation-fr.srt",
          cue_count: 1,
          cues: [
            {
              cue_index: 1,
              start_seconds: 0.2,
              end_seconds: 2.5,
              translated_text: "French live cue",
              transcript_reference: "segment-1",
            },
          ],
          quality_notes: [
            {
              category: "placeholder",
              detail: "Live French note",
              confidence_score: 0.6,
            },
          ],
        },
      ],
    };

    const mockVoiceArtifact = {
      voice_id: 501,
      request_id: 502,
      audio_uri: "/live/voice.mp3",
      duration_seconds: 10.4,
      sample_rate: 44100,
      provider_name: "live-voice",
      provider_model: "live-speech-1",
      details: { tone: "bold" },
      created_at: "2026-04-03T11:00:00Z",
      provenance: {
        provider_name: "live-voice",
        provider_model: "live-speech-1",
        request_metadata: { script: "Live script" },
        response_metadata: { success: true },
      },
    };

    const mockLipSyncArtifact = {
      lipsync_id: 601,
      request_id: 602,
      video_uri: "/live/lipsync.mp4",
      duration_seconds: 12.2,
      provider_name: "live-lipsync",
      provider_model: "live-dance-1",
      metadata: { resolution: "1080x1920" },
      created_at: "2026-04-03T11:05:00Z",
      disclosure: {
        disclosure_label: "live synthetic avatar",
        original_character_reference: "vector-avatar",
        consent_confirmed: true,
      },
    };

    vi.doMock("@/lib/api/providerGateway", () => {
      const providerSpies = {
        fetchAnalysis: vi.fn().mockResolvedValue(mockAnalysis),
        fetchTranscript: vi.fn().mockResolvedValue(mockTranscript),
        fetchCaptionPlan: vi.fn().mockResolvedValue(mockCaptionPlan),
        requestTranslationBatch: vi.fn().mockResolvedValue(mockTranslationBatch),
        fetchClip: vi.fn().mockResolvedValue({
          clip_id: 101,
          clip_path: "/mock/clip.mp4",
          duration_seconds: 4,
          start_seconds: 1,
          end_seconds: 5,
          transcript_segment_id: null,
          best_clip: true,
          platform_hint: "tiktok",
          style_notes: "Live style notes",
        }),
        createSource: vi.fn().mockResolvedValue({
          id: 1,
        }),
        createIngestJob: vi.fn().mockResolvedValue({
          id: 2,
          source_id: 1,
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
          source_id: 1,
          prepared_media: { path: "/mock/prepared.mp4", size_bytes: 1 },
          manifest: {
            manifest_path: "/mock/manifest.json",
            provider: "mock-provider",
            artifact_id: "artifact-1",
            metadata: {
              duration_seconds: 4,
              width: 1920,
              height: 1080,
              fps: 30,
              aspect_ratio: "16:9",
              has_audio: true,
              container: "mp4",
              codec: "h264",
            },
          },
        } as never),
        ingestUpload: vi.fn().mockResolvedValue({
          source_id: 1,
          prepared_media: { path: "/mock/prepared.mp4", size_bytes: 1 },
          manifest: {
            manifest_path: "/mock/upload-manifest.json",
            provider: "mock-provider",
            artifact_id: "artifact-upload",
            metadata: {
              duration_seconds: 4,
              width: 1920,
              height: 1080,
              fps: 30,
              aspect_ratio: "16:9",
              has_audio: true,
              container: "mp4",
              codec: "h264",
            },
          },
        } as never),
        transcribeJob: vi.fn().mockResolvedValue({
          id: 3,
          source_id: 1,
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
          analysis_id: 555,
          transcript_id: 987,
          overall_score: 8.1,
          clip_count: 0,
          signals: [],
          clips: [],
          decision_text: "Live",
        }),
        fetchVoiceArtifact: vi.fn().mockResolvedValue(mockVoiceArtifact),
        fetchLipSyncArtifact: vi.fn().mockResolvedValue(mockLipSyncArtifact),
      };

      return { ProviderGatewayClient: providerSpies };
    });

    const { default: LiveReviewPage } = await import("@/app/review/page");
    const { Providers: LiveProviders } = await import("@/app/providers");
    render(
      <LiveProviders>
        <LiveReviewPage />
      </LiveProviders>,
    );

    expect(await screen.findByText(/Provider live/i)).toBeInTheDocument();
    expect(await screen.findByText(/Live analysis rationale/i)).toBeInTheDocument();
    const liveCaptionMatches = await screen.findAllByText(/Live caption cue/i);
    expect(liveCaptionMatches.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(await screen.findByRole("button", { name: "Spanish" }));
    expect(await screen.findByText(/Spanish live cue/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Spanish note/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "French" }));
    expect(await screen.findByText(/French live cue/i)).toBeInTheDocument();
      expect(screen.getByText(/Live French note/i)).toBeInTheDocument();

      expect(await screen.findByText(/Live captions/i)).toBeInTheDocument();
      expect(await screen.findByText(/Live translations/i)).toBeInTheDocument();
      expect(await screen.findByText(/Voice live/i)).toBeInTheDocument();
      expect(await screen.findByText(/Lip-sync live/i)).toBeInTheDocument();
      expect(await screen.findByText(/Character: vector-avatar/i)).toBeInTheDocument();

      vi.resetModules();
    });
});
