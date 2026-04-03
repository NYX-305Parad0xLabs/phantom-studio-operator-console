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

  it("renders provider clip candidates when live mode is enabled", async () => {
    vi.resetModules();
    const actualConfig = await vi.importActual("@/lib/config");
    vi.doMock("@/lib/config", () => ({
      ...actualConfig,
      providerGatewayBaseUrl: "https://provider.example",
      integrationMode: "live",
      defaultProviderAnalysisId: 99,
      defaultProviderTranscriptId: 42,
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

    vi.doMock("@/lib/api/providerGateway", () => ({
      ProviderGatewayClient: {
        fetchAnalysis: vi.fn().mockResolvedValue(mockAnalysis),
        fetchTranscript: vi.fn().mockResolvedValue(mockTranscript),
      },
    }));

    const { default: LiveReviewPage } = await import("@/app/review/page");
    const { Providers: LiveProviders } = await import("@/app/providers");
    render(
      <LiveProviders>
        <LiveReviewPage />
      </LiveProviders>,
    );

    expect(await screen.findByText(/Provider live/i)).toBeInTheDocument();
    expect(await screen.findByText(/Live analysis rationale/i)).toBeInTheDocument();

    vi.resetModules();
  });
});
