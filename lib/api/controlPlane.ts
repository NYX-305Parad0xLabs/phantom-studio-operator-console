import { controlPlaneBaseUrl, operatorAuthToken } from "@/lib/config";

import { runStageOrder, RunStage, RunStageStatus } from "@/lib/runs/status";

const mockRun = {
  id: "run-123",
  project: "original-crew",
  status: "ready",
  stage: "review",
  clipCount: 3,
  sourceType: "url",
  platforms: ["tiktok"],
  updatedAt: new Date().toISOString(),
  stages: runStageOrder.map((stage, index) => ({
    stage,
    status: (index === 0 ? "complete" : index === 1 ? "running" : "pending") as RunStageStatus,
    startedAt: new Date(Date.now() - (runStageOrder.length - index) * 60000).toISOString(),
    completedAt:
      index === 0
        ? new Date(Date.now() - (runStageOrder.length - index - 1) * 60000).toISOString()
        : undefined,
  })),
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
export type RunStageRecord = {
  stage: RunStage;
  status: RunStageStatus;
  startedAt: string;
  completedAt: string | undefined;
};

export type WorkflowRunDetail = WorkflowRunSummary & {
  stages: RunStageRecord[];
};

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
  async submitRun(payload: IntakeSubmission): Promise<WorkflowRunDetail> {
    return request("/workflow-runs", { method: "POST", body: payload });
  },
};
