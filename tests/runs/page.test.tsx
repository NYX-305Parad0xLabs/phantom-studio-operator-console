import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import RunsPage from "@/app/runs/page";
import { ControlPlaneClient, RunStageRecord } from "@/lib/api/controlPlane";
import { Providers } from "@/app/providers";
import { runStageOrder, RunStageStatus } from "@/lib/runs/status";

const stageRecords: RunStageRecord[] = runStageOrder.map((stage, index) => ({
  stage,
  status: (index === 0 ? "complete" : "pending") as RunStageStatus,
  startedAt: new Date().toISOString(),
  completedAt: index === 0 ? new Date().toISOString() : undefined,
}));

const mockRun = {
  id: "run-abc",
  project: "studio",
  status: "ready",
  stage: "ingest",
  clipCount: 1,
  sourceType: "url",
  platforms: ["tiktok"],
  updatedAt: new Date().toISOString(),
  stages: stageRecords,
};

describe("RunsPage", () => {
  it("renders a table of runs", async () => {
    vi.spyOn(ControlPlaneClient, "listRuns").mockResolvedValue([mockRun]);

    render(
      <Providers>
        <RunsPage />
      </Providers>,
    );

    expect(await screen.findByText("run-abc")).toBeInTheDocument();
    expect(screen.getByText("studio")).toBeInTheDocument();
  });

  it("filters by project name", async () => {
    vi.spyOn(ControlPlaneClient, "listRuns").mockResolvedValue([mockRun]);

    render(
      <Providers>
        <RunsPage />
      </Providers>,
    );

    expect(await screen.findByText("run-abc")).toBeInTheDocument();
  });
});
