import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useParams: () => ({ runId: "123" }),
}));

import RunDetailPage from "@/app/runs/[runId]/page";
import { ControlPlaneClient, RunStageRecord } from "@/lib/api/controlPlane";
import { Providers } from "@/app/providers";
import { runStageOrder } from "@/lib/runs/status";

const stageEntries: RunStageRecord[] = [
  {
    stage: runStageOrder[0],
    status: "completed",
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: new Date(Date.now() - 590000).toISOString(),
  },
  {
    stage: runStageOrder[1],
    status: "running",
    startedAt: new Date(Date.now() - 300000).toISOString(),
    completedAt: undefined,
  },
];

const mockDetail = {
  id: 123,
  project: "studio",
  status: "running",
  stage: runStageOrder[1],
  clipCount: 2,
  sourceType: "url",
  platforms: ["tiktok"],
  updatedAt: new Date().toISOString(),
  stages: stageEntries,
};

describe("RunDetailPage", () => {
  it("renders timeline stages", async () => {
    vi.spyOn(ControlPlaneClient, "fetchRun").mockResolvedValue(mockDetail);

    render(
      <Providers>
        <RunDetailPage />
      </Providers>,
    );

    expect(await screen.findByText("Run 123")).toBeVisible();
    expect(await screen.findByText("Character prep")).toBeVisible();
    expect(await screen.findByText("Image")).toBeVisible();
  });
});
