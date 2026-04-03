import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useParams: () => ({ runId: "run-123" }),
}));

import RunDetailPage from "@/app/runs/[runId]/page";
import { ControlPlaneClient, RunStageRecord } from "@/lib/api/controlPlane";
import { Providers } from "@/app/providers";
import { RunStageStatus } from "@/lib/runs/status";

const stageEntries: RunStageRecord[] = [
  {
    stage: "ingest",
    status: "complete",
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: new Date(Date.now() - 590000).toISOString(),
  },
  {
    stage: "transcription",
    status: "running",
    startedAt: new Date(Date.now() - 300000).toISOString(),
    completedAt: undefined,
  },
];

const mockDetail = {
  id: "run-123",
  project: "studio",
  status: "running",
  stage: "transcription",
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

    expect(await screen.findByText("Run run-123")).toBeVisible();
    expect(await screen.findByText("Ingest")).toBeVisible();
    expect(await screen.findByText("Transcription")).toBeVisible();
  });
});
