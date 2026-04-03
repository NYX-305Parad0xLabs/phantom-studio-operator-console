import { describe, expect, it, vi } from "vitest";

import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { ProviderGatewayClient } from "@/lib/api/providerGateway";
import { buildSubmissionPayload, submitIntakeRun } from "@/lib/intake/service";
import { IntakeFormValues } from "@/lib/intake/schema";

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

  it("submits to both control plane and provider gateway", async () => {
    const projectSpy = vi
      .spyOn(ControlPlaneClient, "createProject")
      .mockResolvedValue({ id: "proj-1", name: "Original Creator" });
    const submitSpy = vi
      .spyOn(ControlPlaneClient, "submitRun")
      .mockResolvedValue({
        id: "run-1",
        project: "Original Creator",
        status: "queued",
        stage: "ingest",
        clipCount: 2,
      });
    const providerSpy = vi
      .spyOn(ProviderGatewayClient, "triggerIngest")
      .mockResolvedValue({ status: "queued", ingestId: "ingest-1" });

    const result = await submitIntakeRun(sampleValues);
    expect(result.id).toBe("run-1");
    expect(projectSpy).toHaveBeenCalled();
    expect(submitSpy).toHaveBeenCalled();
    expect(providerSpy).toHaveBeenCalled();
  });

  it("propagates control-plane errors", async () => {
    vi.spyOn(ControlPlaneClient, "createProject").mockRejectedValue(new Error("boom"));
    await expect(submitIntakeRun(sampleValues)).rejects.toThrow("boom");
  });
});
