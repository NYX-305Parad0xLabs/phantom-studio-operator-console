import { afterEach, describe, expect, it, vi } from "vitest";

describe("health client", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("fetches live health from both backends", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "https://control",
      providerGatewayBaseUrl: "https://provider",
      integrationMode: "live",
      operatorAuthToken: "token",
      providerAuthToken: "provider-token",
    }));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "live" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "ready", environment: "prod" }) });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchControlPlaneHealth } = await import("@/lib/api/health");
    const result = await fetchControlPlaneHealth();

    expect(result).toHaveLength(2);
    expect(result[0].service).toBe("control-plane");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("skips when integration mode is mock", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "https://control",
      providerGatewayBaseUrl: "https://provider",
      integrationMode: "mock",
      operatorAuthToken: "token",
      providerAuthToken: "provider-token",
    }));
    const { fetchControlPlaneHealth } = await import("@/lib/api/health");
    const result = await fetchControlPlaneHealth();

    expect(result).toHaveLength(0);
  });
});
