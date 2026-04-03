import { controlPlaneBaseUrl, operatorAuthToken } from "@/lib/config";

const mockRun = {
  id: "run-123",
  project: "original-crew",
  status: "ready",
  stage: "review",
  clipCount: 3,
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!controlPlaneBaseUrl) {
    return Promise.resolve(mockRun as unknown as T);
  }

  const res = await fetch(`${controlPlaneBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${operatorAuthToken}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error("Control plane request failed");
  }

  return res.json();
}

export type WorkflowRunSummary = typeof mockRun;

export const ControlPlaneClient = {
  async listRuns(): Promise<WorkflowRunSummary[]> {
    if (!controlPlaneBaseUrl) {
      return Promise.resolve([mockRun]);
    }
    return request<WorkflowRunSummary[]>("/runs");
  },
  async fetchRun(runId: string): Promise<WorkflowRunSummary> {
    return request(`/runs/${runId}`);
  },
  async submitIntake(payload: { sourceUrl: string; mode: "single_best" | "series" }) {
    return request("/workflow-runs", { method: "POST", body: payload });
  },
};
