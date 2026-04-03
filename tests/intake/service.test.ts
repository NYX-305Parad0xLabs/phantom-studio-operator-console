import { describe, expect, it, vi } from "vitest";

import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { buildSubmissionPayload, submitIntakeRun } from "@/lib/intake/service";
import { IntakeFormValues } from "@/lib/intake/schema";
import { RunStageStatus, runStageOrder } from "@/lib/runs/status";

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

describe("intake service", () => {
  it("builds normalized payload", () => {
    const payload = buildSubmissionPayload(sampleValues);
    expect(payload).toMatchObject({
      sourceType: "url",
      clipMode: "series_max_3",
      targetLanguages: ["en", "es"],
    });
  });

  it("submits to the control plane intake", async () => {
    const projectSpy = vi
      .spyOn(ControlPlaneClient, "createProject")
      .mockResolvedValue({ id: "proj-1", name: "Original Creator" });
    const stageRecords = runStageOrder.map((stage, index) => ({
      stage,
      status: (index === 0 ? "completed" : "pending") as RunStageStatus,
      startedAt: new Date().toISOString(),
      completedAt: index === 0 ? new Date().toISOString() : undefined,
    }));

    const submitSpy = vi
      .spyOn(ControlPlaneClient, "submitRun")
      .mockResolvedValue({
        id: 1,
        project: "Original Creator",
        status: "queued",
        stage: "character_prepare",
        clipCount: 2,
        sourceType: "url",
        platforms: ["tiktok"],
        updatedAt: new Date().toISOString(),
        stages: stageRecords,
      });
    const result = await submitIntakeRun(sampleValues);
    expect(result.id).toBe(1);
    expect(projectSpy).toHaveBeenCalled();
    expect(submitSpy).toHaveBeenCalled();
  });

  it("propagates control-plane errors", async () => {
    vi.spyOn(ControlPlaneClient, "createProject").mockRejectedValue(new Error("boom"));
    await expect(submitIntakeRun(sampleValues)).rejects.toThrow("boom");
  });
});
