import { beforeEach, describe, expect, it, vi } from "vitest";

describe("ControlPlaneClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("maps live run summaries", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "https://control",
      integrationMode: "live",
      operatorAuthToken: "op-token",
    }));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 5,
            project_id: 7,
            stage: "human_review",
            status: "running",
            review_status: "pending",
            workflow_metadata: { project_name: "live-run", sourceType: "upload" },
            assets: [],
          },
        ],
      });
    vi.stubGlobal("fetch", fetchMock);

    const { ControlPlaneClient: Client } = await import("@/lib/api/controlPlane");
    const runs = await Client.listRuns();

    expect(fetchMock).toHaveBeenCalled();
    expect(runs[0].id).toBe(5);
    expect(runs[0].project).toBe("live-run");
    expect(runs[0].stage).toBe("human_review");
  });

  it("falls back when live endpoint is missing", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "https://control",
      integrationMode: "live",
      operatorAuthToken: "op-token",
    }));
    const fetchMock = vi.fn(() => Promise.reject(new Error("not available")));
    vi.stubGlobal("fetch", fetchMock);

    const { ControlPlaneClient: Client } = await import("@/lib/api/controlPlane");
    const runs = await Client.listRuns();

    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0].project).toMatch(/project-/);
  });

  it("reads provenance manifest from live backend", async () => {
    vi.doMock("@/lib/config", () => ({
      controlPlaneBaseUrl: "https://control",
      integrationMode: "live",
      operatorAuthToken: "op-token",
    }));
    const manifest = { manifest: { id: "abc" }, manifest_checksum: "sha", created_at: new Date().toISOString() };
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => manifest,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { ControlPlaneClient: Client } = await import("@/lib/api/controlPlane");
    const result = await Client.fetchProvenance(1);

    expect(result.manifest_checksum).toBe("sha");
    expect(fetchMock).toHaveBeenCalledWith("https://control/workflow-runs/1/provenance", expect.any(Object));
  });
});
