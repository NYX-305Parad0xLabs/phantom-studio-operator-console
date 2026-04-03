import { controlPlaneBaseUrl, operatorAuthToken } from "@/lib/config";

const mockRun = {
  id: "run-123",
  project: "original-crew",
  status: "ready",
  stage: "review",
  clipCount: 3,
};

const mockProject = {
  id: "proj-abc",
  name: "original-crew",
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!controlPlaneBaseUrl) {
    if (path.startsWith("/projects")) {
      return Promise.resolve(mockProject as unknown as T);
    }
    if (path.startsWith("/workflow-runs")) {
      return Promise.resolve(mockRun as unknown as T);
    }
    if (path.startsWith("/runs")) {
      return Promise.resolve([mockRun] as unknown as T);
    }
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

export type IntakeSubmission = {
  sourceType: "url" | "upload";
  sourceReference: string;
  projectId: string;
  clipMode: "single_best" | "series_max_3";
  targetPlatforms: string[];
  targetLanguages: string[];
  styleNotes?: string;
  syntheticDisclosure?: string;
};

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
  async createProject(payload: { name: string }) {
    return request("/projects", { method: "POST", body: payload });
  },
  async submitRun(payload: IntakeSubmission): Promise<WorkflowRunSummary> {
    return request("/workflow-runs", { method: "POST", body: payload });
  },
};
