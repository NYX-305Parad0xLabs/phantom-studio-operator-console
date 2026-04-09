import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RunPage from "@/app/factory/run/page";
import { Providers } from "@/app/providers";
import { ControlPlaneClient } from "@/lib/api/controlPlane";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "runId") return "77";
      if (key === "state") return "live";
      return null;
    },
  }),
}));

const runRecord = {
  id: 77,
  plan_id: 101,
  status: "failed",
  review_status: "pending" as const,
  sync: {
    provider_job_id: "job-1",
    provider_status: "failed",
    stitched_video_uri: "http://localhost/video.mp4",
    metadata_uri: "http://localhost/video.json",
    provider_provenance: { synthetic: true },
    provider_manifest: { output: "manifest" },
    failure_reason: "provider timeout",
  },
  run_metadata: {
    transition_trail: [
      {
        from: "running",
        to: "failed",
        reason: "provider_sync_failed",
        actor: "system",
        at: new Date().toISOString(),
      },
    ],
  },
  events: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("Factory run page", () => {
  it("renders timeline, diagnostics, and provider failure", async () => {
    vi.spyOn(ControlPlaneClient, "fetchFactoryRunRecord").mockResolvedValue({
      state: "live",
      data: runRecord,
    });
    vi.spyOn(ControlPlaneClient, "fetchFactoryDiagnostics").mockResolvedValue({
      state: "live",
      data: {
        total_runs: 2,
        status_counts: { failed: 1, human_review: 1 },
        review_pending: 1,
        stuck_runs: [],
        failed_runs: [{ run_id: 77, failure_reason: "provider timeout" }],
        stuck_threshold_seconds: 600,
      },
    });

    render(
      <Providers>
        <RunPage />
      </Providers>,
    );

    expect(await screen.findByText(/Provider error: provider timeout/i)).toBeInTheDocument();
    expect(await screen.findByText(/Status timeline/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total runs: 2/i)).toBeInTheDocument();
  });

  it("allows retry from plan", async () => {
    vi.spyOn(ControlPlaneClient, "fetchFactoryRunRecord").mockResolvedValue({
      state: "live",
      data: runRecord,
    });
    vi.spyOn(ControlPlaneClient, "fetchFactoryDiagnostics").mockResolvedValue({
      state: "live",
      data: {
        total_runs: 1,
        status_counts: { failed: 1 },
        review_pending: 0,
        stuck_runs: [],
        failed_runs: [{ run_id: 77, failure_reason: "provider timeout" }],
        stuck_threshold_seconds: 600,
      },
    });
    const createSpy = vi
      .spyOn(ControlPlaneClient, "createFactoryRunRecord")
      .mockResolvedValue({ state: "mocked", data: { ...runRecord, id: 78, status: "queued" } });

    render(
      <Providers>
        <RunPage />
      </Providers>,
    );

    const retry = await screen.findByRole("button", { name: /Retry from this plan/i });
    fireEvent.click(retry);

    expect(createSpy).toHaveBeenCalledWith({ planId: 101 });
  });
});
