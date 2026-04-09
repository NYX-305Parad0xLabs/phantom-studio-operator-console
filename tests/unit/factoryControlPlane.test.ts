import { beforeEach, describe, expect, it, vi } from "vitest";

describe("factory control-plane client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns mocked plan envelope when integration mode is mock", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "",
      integrationMode: "mock",
      operatorAuthToken: "operator-token",
    }));

    const { ControlPlaneClient } = await import("@/lib/api/controlPlane");
    const result = await ControlPlaneClient.createFactoryPlanRecord({
      productName: "Test Product",
      productBrief: "Demo",
      influencerLockId: "luna-v2",
      targetPlatform: "tiktok",
      rightsAsserted: true,
      disclosedSynthetic: true,
      disclosureText: "This is AI-generated synthetic content.",
      preferredBackend: "mock",
    });

    expect(result.state).toBe("mocked");
    expect(result.data.scene_breakdown.length).toBeGreaterThan(0);
  });

  it("returns failed envelope with fallback when live call throws", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "https://control",
      integrationMode: "live",
      operatorAuthToken: "operator-token",
    }));
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));

    const { ControlPlaneClient } = await import("@/lib/api/controlPlane");
    const result = await ControlPlaneClient.fetchFactoryRunRecord(99);

    expect(result.state).toBe("failed");
    expect(result.data.id).toBeGreaterThan(0);
  });

  it("returns mocked diagnostics envelope in mock mode", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "",
      integrationMode: "mock",
      operatorAuthToken: "operator-token",
    }));

    const { ControlPlaneClient } = await import("@/lib/api/controlPlane");
    const result = await ControlPlaneClient.fetchFactoryDiagnostics();

    expect(result.state).toBe("mocked");
    expect(result.data.total_runs).toBeGreaterThan(0);
  });
});
