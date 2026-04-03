import { controlPlaneBaseUrl, integrationMode, operatorAuthToken } from "@/lib/config";

import { runStageOrder, RunStage, RunStageStatus } from "@/lib/runs/status";

export const mockRun = {
  id: 123,
  project: "project-mock-run",
  status: "completed",
  stage: "publish_prepare" as RunStage,
  clipCount: 3,
  sourceType: "url",
  platforms: ["tiktok"],
  updatedAt: new Date().toISOString(),
  stages: runStageOrder.map((stage, index) => ({
    stage,
    status:
      (index === runStageOrder.length - 1
        ? "completed"
        : index === runStageOrder.length - 2
        ? "running"
        : "pending") as RunStageStatus,
    startedAt: new Date(Date.now() - (runStageOrder.length - index) * 60000).toISOString(),
    completedAt:
      index < runStageOrder.length - 2
        ? new Date(Date.now() - (runStageOrder.length - index - 1) * 60000).toISOString()
        : undefined,
    })),
  assets: [
    {
      id: 1,
      asset_type: "lipsync",
      provider: "mock-provider",
      uri: "https://example.com/mock-lipsync.mp4",
      kind: "lipsync",
      asset_metadata: { duration_seconds: 30, has_audio: true },
    },
  ],
};

const mockProject = {
  id: "proj-abc",
  name: "project-mock-run",
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!controlPlaneBaseUrl || integrationMode !== "live") {
    if (path.startsWith("/projects")) {
      return Promise.resolve(mockProject as unknown as T);
    }
    if (path.startsWith("/workflow-runs") && options.method === "POST") {
      return Promise.resolve(mockRun as unknown as T);
    }
    if (path.includes("/provenance")) {
      return Promise.resolve(mockProvenance as unknown as T);
    }
    if (path.startsWith("/publish-jobs")) {
      return Promise.resolve(mockPublishJob as unknown as T);
    }
    if (path.startsWith("/runs")) {
      return Promise.resolve([mockRun] as unknown as T);
    }
    return Promise.resolve(mockRun as unknown as T);
  }

  const response = await fetch(`${controlPlaneBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${operatorAuthToken}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Control plane request failed at ${path}`);
  }

  return response.json();
}

function coerceStage(value: string): RunStage {
  return runStageOrder.includes(value as RunStage) ? (value as RunStage) : runStageOrder[runStageOrder.length - 1];
}

function buildStageTimeline(current: RunStage): RunStageRecord[] {
  const currentIndex = runStageOrder.indexOf(current);
  const now = Date.now();
  return runStageOrder.map((stage, index) => {
    let status: RunStageStatus = "pending";
    if (index < currentIndex) {
      status = "completed";
    } else if (index === currentIndex) {
      status = "running";
    }
    return {
      stage,
      status,
      startedAt: new Date(now - (runStageOrder.length - index) * 60000).toISOString(),
      completedAt:
        status === "completed"
          ? new Date(now - (runStageOrder.length - index - 1) * 60000).toISOString()
          : undefined,
    };
  });
}

export type RunStageRecord = {
  stage: RunStage;
  status: RunStageStatus;
  startedAt: string;
  completedAt: string | undefined;
};

export type WorkflowRunSummary = {
  id: number;
  project: string;
  stage: RunStage;
  status: string;
  clipCount?: number;
  sourceType: string;
  platforms: string[];
  updatedAt?: string;
  stages: RunStageRecord[];
};

export type WorkflowRunResponseRaw = {
  id: number;
  project_id: number;
  stage: string;
  status: string;
  review_status: string;
  workflow_metadata: Record<string, unknown>;
  assets: unknown[];
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

export type DecisionSubmission = {
  decisionType: "approve" | "reject" | "regenerate";
  notes: string;
  artifactScope: string;
};

export type ProvenanceDetail = {
  workflow_run_id: number;
  manifest: Record<string, unknown>;
  manifest_checksum: string;
  created_at: string;
};

export type PublishAttempt = {
  id: number;
  status: string;
  attempted_at: string;
  detail: string;
  error_message?: string | null;
};

export type PublishJobDetail = {
  id: number;
  status: string;
  scheduled_for?: string | null;
  attempts: PublishAttempt[];
  receipt?: {
    published_at: string;
    provider_name: string;
    published_url?: string;
  };
};

export type PublishPreparePayload = {
  assetUri: string;
  platformSlug: string;
  metadata?: Record<string, unknown>;
};

export type PublishSchedulePayload = {
  scheduledFor: string;
  note?: string;
};

const mockProvenance: ProvenanceDetail = {
  workflow_run_id: mockRun.id,
  manifest: {
    note: "Mocked manifest until backend wiring completes",
  },
  manifest_checksum: "sha256:provenance-placeholder",
  created_at: new Date().toISOString(),
};

const mockPublishJob: PublishJobDetail = {
  id: 1,
  status: "scheduled",
  scheduled_for: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  attempts: [
    {
      id: 1,
      status: "prepared",
      attempted_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      detail: "Mock export bundle verified",
    },
    {
      id: 2,
      status: "scheduled",
      attempted_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      detail: "Mock scheduling entry created",
    },
  ],
};

function mapLiveRun(run: WorkflowRunResponseRaw): WorkflowRunSummary {
  const metadata = run.workflow_metadata ?? {};
  const stage = coerceStage(run.stage);
  const projectName = (metadata["project_name"] as string) ?? `project-${run.project_id}`;
  const sourceType = (metadata["sourceType"] as string) ?? "url";
  const platforms = (metadata["platforms"] as string[]) ?? [];
  const updatedAt = (metadata["updated_at"] as string) ?? (metadata["updatedAt"] as string);
  return {
    id: run.id,
    project: projectName,
    stage,
    status: run.status,
    clipCount: metadata["clipCount"] as number | undefined,
    sourceType,
    platforms,
    updatedAt,
    stages: buildStageTimeline(stage),
  };
}

export const ControlPlaneClient = {
  async listRuns(): Promise<WorkflowRunSummary[]> {
    if (integrationMode === "live") {
      try {
        const runs = await request<WorkflowRunResponseRaw[]>("/workflow-runs");
        return runs.map(mapLiveRun);
      } catch (error) {
        console.warn("Control plane list runs unavailable", error);
      }
    }
    return [mockRun];
  },

  async fetchRun(runId: number): Promise<WorkflowRunSummary> {
    const run = await loadRunDetail(runId);
    return mapLiveRun(run);
  },

  async fetchRunDetail(runId: number): Promise<WorkflowRunResponseRaw> {
    return loadRunDetail(runId);
  },

  async createProject(payload: { name: string }) {
    return request("/projects", { method: "POST", body: payload });
  },

  async submitRun(payload: IntakeSubmission): Promise<WorkflowRunSummary> {
    return request("/workflow-runs", { method: "POST", body: payload });
  },

  async approveRun(runId: number, payload: DecisionSubmission) {
    return request(`/workflow-runs/${runId}/approve`, {
      method: "POST",
      body: payload,
    });
  },

  async rejectRun(runId: number, payload: DecisionSubmission) {
    return request(`/workflow-runs/${runId}/reject`, {
      method: "POST",
      body: payload,
    });
  },

  async requestRegenerate(runId: number, payload: DecisionSubmission) {
    return request(`/workflow-runs/${runId}/request-regenerate`, {
      method: "POST",
      body: payload,
    });
  },

  async fetchProvenance(runId: number): Promise<ProvenanceDetail> {
    if (integrationMode === "live") {
      try {
        return await request<ProvenanceDetail>(`/workflow-runs/${runId}/provenance`);
      } catch (error) {
        console.warn("Control plane provenance unavailable", error);
      }
    }
    return mockProvenance;
  },

  async fetchPublishJob(jobId: number): Promise<PublishJobDetail> {
    if (integrationMode === "live") {
      try {
        return await request<PublishJobDetail>(`/publish-jobs/${jobId}`);
      } catch (error) {
        console.warn("Control plane publish job unavailable", error);
      }
    }
    return mockPublishJob;
  },

  async preparePublish(runId: number, payload: PublishPreparePayload): Promise<PublishJobDetail> {
    return request<PublishJobDetail>(`/workflow-runs/${runId}/prepare-publish`, {
      method: "POST",
      body: {
        asset_uri: payload.assetUri,
        platform_slug: payload.platformSlug,
        metadata: payload.metadata ?? {},
      },
    });
  },

  async schedulePublishJob(jobId: number, payload: PublishSchedulePayload): Promise<PublishJobDetail> {
    return request<PublishJobDetail>(`/publish-jobs/${jobId}/schedule`, {
      method: "POST",
      body: {
        scheduled_for: payload.scheduledFor,
        note: payload.note,
      },
    });
  },

  async executePublishJob(jobId: number): Promise<PublishJobDetail> {
    return request<PublishJobDetail>(`/publish-jobs/${jobId}/execute`, {
      method: "POST",
    });
  },
};

const mockRunDetail: WorkflowRunResponseRaw = {
  id: mockRun.id,
  project_id: 1,
  stage: mockRun.stage,
  status: mockRun.status,
  review_status: "approved",
  workflow_metadata: {
    project_name: mockRun.project,
    sourceType: mockRun.sourceType,
    platforms: mockRun.platforms,
    updatedAt: mockRun.updatedAt,
    clipCount: mockRun.clipCount,
  },
  assets: mockRun.assets,
};

async function loadRunDetail(runId: number): Promise<WorkflowRunResponseRaw> {
  if (integrationMode === "live") {
    try {
      return await request<WorkflowRunResponseRaw>(`/workflow-runs/${runId}`);
    } catch (error) {
      console.warn("Control plane run detail unavailable", error);
    }
  }
  return mockRunDetail;
}
