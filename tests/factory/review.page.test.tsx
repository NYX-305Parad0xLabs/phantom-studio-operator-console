import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReviewPage from "@/app/factory/review/page";
import { Providers } from "@/app/providers";
import { ControlPlaneClient } from "@/lib/api/controlPlane";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "runId") return "77";
      if (key === "state") return "waiting_for_review";
      return null;
    },
  }),
}));

const baseRun = {
  id: 77,
  plan_id: 101,
  status: "human_review",
  review_status: "pending" as const,
  sync: {
    provider_job_id: "job-1",
    provider_status: "completed",
    stitched_video_uri: "http://localhost/video.mp4",
    metadata_uri: "http://localhost/video.json",
    provider_provenance: {},
    provider_manifest: {},
  },
  run_metadata: { publish_prepare_allowed: false },
  events: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("Factory review page", () => {
  it("handles approve and reject state transitions", async () => {
    vi.spyOn(ControlPlaneClient, "fetchFactoryRunRecord").mockResolvedValue({
      state: "waiting_for_review",
      data: baseRun,
    });
    vi.spyOn(ControlPlaneClient, "approveFactoryRunRecord").mockResolvedValue({
      state: "live",
      data: {
        ...baseRun,
        status: "approved",
        review_status: "approved",
        run_metadata: { publish_prepare_allowed: true },
      },
    });

    render(
      <Providers>
        <ReviewPage />
      </Providers>,
    );

    expect(await screen.findByText(/Publish state: Blocked pending approval/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Approve run/i }));

    expect(await screen.findByText(/Publish state: Unblocked after approval/i)).toBeInTheDocument();
  });
});
