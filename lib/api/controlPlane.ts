import { controlPlaneBaseUrl, integrationMode, operatorAuthToken } from "@/lib/config";

import { runStageOrder, RunStage, RunStageStatus } from "@/lib/runs/status";
import { ProvenanceManifest } from "@/lib/provenance/types";

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
  manifest: ProvenanceManifest;
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

export type PublishExportBundleDetail = {
  id: number;
  workflow_run_id: number;
  manifest_path: string;
  checksum: string;
  created_at: string;
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

export type FactoryPlanRequest = {
  productName: string;
  finishGoal: string;
  influencerLockId: string;
  targetPlatforms: string[];
  targetDurationSeconds: number;
  visualStyle: string;
  startFrameReference?: string;
  endFrameReference?: string;
  callToAction?: string;
  videoBackend?: string;
};

export type FactoryScene = {
  shot_id: string;
  duration_seconds: number;
  start_frame_reference?: string | null;
  end_frame_reference?: string | null;
  prompt: string;
};

export type FactoryPlanResponse = {
  workflow_run_id: number;
  product_name: string;
  influencer_lock_id: string;
  script: string;
  scenes: FactoryScene[];
  selected_video_backend: string;
  nulla_agent_tasks: {
    agent: string;
    goal: string;
    inputs: Record<string, unknown>;
  }[];
  editing_plan: string[];
  next_provider_call: {
    method: string;
    url: string;
    payload: Record<string, unknown>;
  };
  total_duration_seconds: number;
  virality_score?: number | null;
  synthetic_trace?: Record<string, unknown>;
};

export type UGCPostTaskRequest = {
  stitchedVideoUri: string;
  metadataUri?: string;
  targetPlatforms: string[];
  provenance?: Record<string, unknown>;
};

export type UGCPostTaskResponse = {
  workflow_run_id: number;
  status: string;
  provider: string;
  task_id: string;
  message: string;
  payload: Record<string, unknown>;
};

export type FactoryUiStateLabel = "live" | "mocked" | "failed" | "waiting_for_review";

export type FactoryPlanCreateRequest = {
  workflowRunId?: number;
  productName: string;
  productBrief: string;
  influencerLockId: string;
  targetPlatform: string;
  rightsAsserted: boolean;
  disclosedSynthetic: boolean;
  disclosureText: string;
  preferredBackend?: string;
};

export type FactoryPlanRecord = {
  id: number;
  workflow_run_id?: number | null;
  product_input: {
    product_name: string;
    product_brief: string;
    planner_mode?: string | null;
    planner_fallback_reason?: string | null;
  };
  influencer_lock_id: string;
  target_platform: string;
  scene_breakdown: FactoryScene[];
  provider_handoff_payload: Record<string, unknown>;
  disclosure_text: string;
  rights_asserted: boolean;
  review_required: boolean;
  created_at: string;
  updated_at: string;
};

export type FactoryRunRecord = {
  id: number;
  plan_id: number;
  status: string;
  review_status: "pending" | "approved" | "changes_requested" | "rejected";
  sync: {
    provider_job_id?: string | null;
    provider_status?: string | null;
    stitched_video_uri?: string | null;
    metadata_uri?: string | null;
    provider_provenance: Record<string, unknown>;
    provider_manifest: Record<string, unknown>;
    failure_reason?: string | null;
  };
  run_metadata: Record<string, unknown>;
  events: {
    id: number;
    event_type: string;
    actor?: string | null;
    payload: Record<string, unknown>;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
};

export type FactoryDiagnosticsSummary = {
  total_runs: number;
  status_counts: Record<string, number>;
  review_pending: number;
  stuck_runs: {
    run_id: number;
    status: string;
    updated_at: string;
    provider_status?: string | null;
  }[];
  failed_runs: {
    run_id: number;
    failure_reason?: string | null;
  }[];
  stuck_threshold_seconds: number;
};

export type FactoryRunCreateRequest = {
  planId: number;
};

export type FactoryEnvelope<T> = {
  state: FactoryUiStateLabel;
  data: T;
  error?: string;
};

export type WorkflowRunCreateRaw = {
  id: number;
  project_id: number;
  character_profile_id: number;
  status: string;
  stage: string;
};

const mockManifest: ProvenanceManifest = {
  run: {
    id: mockRun.id,
    project_id: 1,
    character_profile_id: 1,
    status: "completed",
    stage: mockRun.stage,
    review_status: "approved",
    requested_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    workflow_metadata: {
      project_name: mockRun.project,
      sourceType: mockRun.sourceType,
      platforms: mockRun.platforms,
      updatedAt: mockRun.updatedAt,
    },
  },
  character: {
    id: 1,
    name: "Operator avatar",
    disclosed: true,
    persona: "Operator persona",
  },
  disclosure: {
    label: "Original synthetic character disclosed 2026-04-03",
    is_original: true,
    protected_identity: false,
  },
  assets: [
    {
      id: 101,
      asset_type: "render",
      uri: "/mock/render.mp4",
      provider: "provider-gateway",
      kind: "video",
      manifest: {
        local_path: "exports/run-123/render.mp4.json",
        checksum: "sha256:asset-render",
        file_size: 1024,
        metadata: { resolution: "1080x1920", fps: 24 },
      },
    },
  ],
  provider_traces: [
    {
      id: "trace-001",
      stage: "render",
      provider_name: "Flux Render",
      provider_model: "flux-render-v1",
      request_payload: { clip_id: 101 },
      response_payload: { duration_seconds: 15 },
      prompt_text: "Finalize the clip with bold captions and disclosure mention.",
      prompt_spec: { style: "sendshort_like" },
      source_asset_ids: [101],
      generated_asset_id: 202,
      operator_identity: "operator-alex",
      created_at: new Date().toISOString(),
    },
  ],
  reviews: [
    {
      id: 1,
      decision: "approve",
      status: "completed",
      reviewer_role: "operator",
      notes: "Render + captions approved",
      artifact_scope: "render",
      decided_at: new Date().toISOString(),
    },
  ],
  audits: [
    {
      id: 1,
      entity_type: "workflow",
      entity_id: String(mockRun.id),
      action: "export-ready",
      actor: "operator-alex",
      payload: { detail: "Export bundle generated" },
      created_at: new Date().toISOString(),
    },
  ],
};

const mockProvenance: ProvenanceDetail = {
  workflow_run_id: mockRun.id,
  manifest: mockManifest,
  manifest_checksum: "sha256:provenance-placeholder",
  created_at: new Date().toISOString(),
};

const mockExportBundle: PublishExportBundleDetail = {
  id: 1,
  workflow_run_id: mockRun.id,
  manifest_path: "exports/run-123/manifest.json",
  checksum: "sha256:bundle-check",
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

  async createFactoryRun(projectName: string): Promise<number> {
    const created = await request<WorkflowRunCreateRaw>("/workflow-runs", {
      method: "POST",
      body: {
        projectName,
        sourceType: "url",
        sourceReference: "local://factory-input",
        clipMode: "single_best",
        targetPlatforms: ["tiktok"],
        targetLanguages: ["en"],
        styleNotes: "autonomous-ugc-factory",
        syntheticDisclosure: "Synthetic character disclosure required.",
      },
    });
    return created.id;
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

  async fetchExportBundle(runId: number): Promise<PublishExportBundleDetail> {
    if (runId <= 0) {
      return mockExportBundle;
    }
    if (integrationMode === "live") {
      try {
        return await request<PublishExportBundleDetail>(`/workflow-runs/${runId}/export-bundle`, {
          method: "POST",
        });
      } catch (error) {
        console.warn("Control plane export bundle unavailable", error);
      }
    }
    return mockExportBundle;
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

  async createFactoryPlan(runId: number, payload: FactoryPlanRequest): Promise<FactoryPlanResponse> {
    return request<FactoryPlanResponse>(`/workflow-runs/${runId}/ugc-factory-plan`, {
      method: "POST",
      body: payload,
    });
  },

  async fetchFactoryPlan(runId: number): Promise<FactoryPlanResponse> {
    return request<FactoryPlanResponse>(`/workflow-runs/${runId}/ugc-factory-plan`);
  },

  async postFactoryOutput(runId: number, payload: UGCPostTaskRequest): Promise<UGCPostTaskResponse> {
    return request<UGCPostTaskResponse>(`/workflow-runs/${runId}/ugc-factory/post-to-social`, {
      method: "POST",
      body: payload,
    });
  },

  async createFactoryPlanRecord(
    payload: FactoryPlanCreateRequest,
  ): Promise<FactoryEnvelope<FactoryPlanRecord>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      return {
        state: "mocked",
        data: buildMockFactoryPlan(payload),
      };
    }
    try {
      const response = await request<FactoryPlanRecord>("/api/factory/plans", {
        method: "POST",
        body: {
          workflowRunId: payload.workflowRunId,
          productName: payload.productName,
          productBrief: payload.productBrief,
          influencerLockId: payload.influencerLockId,
          targetPlatform: payload.targetPlatform,
          rightsAsserted: payload.rightsAsserted,
          disclosedSynthetic: payload.disclosedSynthetic,
          disclosureText: payload.disclosureText,
          preferredBackend: payload.preferredBackend,
        },
      });
      return { state: "live", data: response };
    } catch (error) {
      return {
        state: "failed",
        data: buildMockFactoryPlan(payload),
        error: error instanceof Error ? error.message : "Factory plan request failed",
      };
    }
  },

  async fetchFactoryPlanRecord(planId: number): Promise<FactoryEnvelope<FactoryPlanRecord>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      return { state: "mocked", data: buildMockFactoryPlan() };
    }
    try {
      const response = await request<FactoryPlanRecord>(`/api/factory/plans/${planId}`);
      return { state: "live", data: response };
    } catch (error) {
      return {
        state: "failed",
        data: buildMockFactoryPlan(),
        error: error instanceof Error ? error.message : "Factory plan lookup failed",
      };
    }
  },

  async createFactoryRunRecord(
    payload: FactoryRunCreateRequest,
  ): Promise<FactoryEnvelope<FactoryRunRecord>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      return { state: "mocked", data: buildMockFactoryRun(payload.planId) };
    }
    try {
      const response = await request<FactoryRunRecord>("/api/factory/runs", {
        method: "POST",
        body: payload,
      });
      return { state: "live", data: response };
    } catch (error) {
      return {
        state: "failed",
        data: buildMockFactoryRun(payload.planId),
        error: error instanceof Error ? error.message : "Factory run launch failed",
      };
    }
  },

  async fetchFactoryRunRecord(runId: number): Promise<FactoryEnvelope<FactoryRunRecord>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      const run = buildMockFactoryRun();
      return {
        state: run.status === "human_review" ? "waiting_for_review" : "mocked",
        data: run,
      };
    }
    try {
      const response = await request<FactoryRunRecord>(`/api/factory/runs/${runId}`);
      const state: FactoryUiStateLabel =
        response.status === "human_review" ? "waiting_for_review" : "live";
      return { state, data: response };
    } catch (error) {
      return {
        state: "failed",
        data: buildMockFactoryRun(),
        error: error instanceof Error ? error.message : "Factory run status failed",
      };
    }
  },

  async approveFactoryRunRecord(
    runId: number,
    notes?: string,
  ): Promise<FactoryEnvelope<FactoryRunRecord>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      const run = buildMockFactoryRun();
      run.status = "approved";
      run.review_status = "approved";
      run.run_metadata.publish_prepare_allowed = true;
      return { state: "mocked", data: run };
    }
    try {
      const response = await request<FactoryRunRecord>(`/api/factory/runs/${runId}/approve`, {
        method: "POST",
        body: { notes: notes ?? "" },
      });
      return { state: "live", data: response };
    } catch (error) {
      return {
        state: "failed",
        data: buildMockFactoryRun(),
        error: error instanceof Error ? error.message : "Factory approval failed",
      };
    }
  },

  async rejectFactoryRunRecord(
    runId: number,
    notes?: string,
  ): Promise<FactoryEnvelope<FactoryRunRecord>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      const run = buildMockFactoryRun();
      run.status = "rejected";
      run.review_status = "rejected";
      return { state: "mocked", data: run };
    }
    try {
      const response = await request<FactoryRunRecord>(`/api/factory/runs/${runId}/reject`, {
        method: "POST",
        body: { notes: notes ?? "" },
      });
      return { state: "live", data: response };
    } catch (error) {
      return {
        state: "failed",
        data: buildMockFactoryRun(),
        error: error instanceof Error ? error.message : "Factory rejection failed",
      };
    }
  },

  async fetchFactoryDiagnostics(): Promise<FactoryEnvelope<FactoryDiagnosticsSummary>> {
    if (integrationMode !== "live" || !controlPlaneBaseUrl) {
      return {
        state: "mocked",
        data: {
          total_runs: 1,
          status_counts: { human_review: 1 },
          review_pending: 1,
          stuck_runs: [],
          failed_runs: [],
          stuck_threshold_seconds: 600,
        },
      };
    }
    try {
      const response = await request<FactoryDiagnosticsSummary>("/api/factory/diagnostics");
      return { state: "live", data: response };
    } catch (error) {
      return {
        state: "failed",
        data: {
          total_runs: 0,
          status_counts: {},
          review_pending: 0,
          stuck_runs: [],
          failed_runs: [],
          stuck_threshold_seconds: 600,
        },
        error: error instanceof Error ? error.message : "Factory diagnostics failed",
      };
    }
  },
};

export const controlPlane = {
  createUGCPlan: (runId: number, payload: FactoryPlanRequest) =>
    ControlPlaneClient.createFactoryPlan(runId, payload),
};

function buildMockFactoryPlan(
  payload?: FactoryPlanCreateRequest,
): FactoryPlanRecord {
  const productName = payload?.productName ?? "Mock Product";
  const productBrief = payload?.productBrief ?? "Mock product brief";
  const lockId = payload?.influencerLockId ?? "luna-v2";
  const platform = payload?.targetPlatform ?? "tiktok";
  return {
    id: 9001,
    workflow_run_id: payload?.workflowRunId ?? 1,
    product_input: {
      product_name: productName,
      product_brief: productBrief,
    },
    influencer_lock_id: lockId,
    target_platform: platform,
    scene_breakdown: [
      {
        shot_id: "scene-1-intro",
        duration_seconds: 4,
        prompt: `Intro for ${productName} with ${lockId}.`,
      },
      {
        shot_id: "scene-2-demo",
        duration_seconds: 6,
        prompt: "Product demonstration with identity lock continuity.",
      },
      {
        shot_id: "scene-3-before-after",
        duration_seconds: 6,
        prompt: "Before/after transition and benefits summary.",
      },
      {
        shot_id: "scene-4-cta",
        duration_seconds: 4,
        prompt: "Call-to-action with synthetic disclosure.",
      },
    ],
    provider_handoff_payload: {
      backend: payload?.preferredBackend ?? "mock",
      consistency_lock: lockId,
      target_platforms: [platform],
    },
    disclosure_text: payload?.disclosureText ?? "This is AI-generated synthetic content.",
    rights_asserted: payload?.rightsAsserted ?? true,
    review_required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildMockFactoryRun(planId = 9001): FactoryRunRecord {
  return {
    id: 7001,
    plan_id: planId,
    status: "human_review",
    review_status: "pending",
    sync: {
      provider_job_id: "mock-job-001",
      provider_status: "completed",
      stitched_video_uri: "https://mock.local/factory-run-7001.mp4",
      metadata_uri: "https://mock.local/factory-run-7001.json",
      provider_provenance: {
        provider: "mock",
        synthetic: true,
        disclosure_required: true,
      },
      provider_manifest: {
        manifest_id: "mock-manifest-001",
        synthetic: true,
      },
    },
    run_metadata: {
      publish_prepare_allowed: false,
    },
    events: [
      {
        id: 1,
        event_type: "run_created",
        actor: "operator",
        payload: { plan_id: planId },
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

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
