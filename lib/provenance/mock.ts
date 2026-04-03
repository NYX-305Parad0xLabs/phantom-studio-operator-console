import {
  AuditEventRecord,
  ProvenanceAssetEntry,
  ProvenanceManifest,
  ProviderTraceRecord,
  ReviewRecord,
} from "@/lib/provenance/types";

const now = new Date().toISOString();

export const mockProviderTraces: ProviderTraceRecord[] = [
  {
    id: "trace-001",
    stage: "render",
    provider_name: "Flux Render",
    provider_model: "flux-render-v1",
    request_payload: { clip_id: 101, style: "sendshort_like" },
    response_payload: { duration_seconds: 15.1 },
    prompt_text: "Render a bold hero clip with caption-first frames.",
    prompt_spec: { accents: "bold", disclosure: "original synthetic" },
    source_asset_ids: [1],
    generated_asset_id: 101,
    operator_identity: "operator-alex",
    created_at: now,
  },
  {
    id: "trace-002",
    stage: "voice",
    provider_name: "ElevenLike",
    provider_model: "studio-voice-latin",
    request_payload: { script: "Keep synthetic disclosure intact" },
    response_payload: { format: "wav", duration_seconds: 16 },
    prompt_text: "Narrate with disclosure and energy.",
    prompt_spec: { tone: "assertive" },
    source_asset_ids: [2],
    generated_asset_id: 102,
    operator_identity: "operator-sam",
    created_at: now,
  },
];

export const mockAssetReferences: ProvenanceAssetEntry[] = [
  {
    id: 1,
    asset_type: "ingest",
    uri: "data/src/phase-one.mp4",
    provider: "local.flow",
    kind: "video",
    manifest: {
      local_path: "artifacts/run-123/asset-1.json",
      checksum: "sha256:ingest-abc",
      file_size: 42_000_000,
      metadata: { duration_seconds: 35, resolution: "1920x1080" },
    },
  },
  {
    id: 101,
    asset_type: "render",
    uri: "data/renders/phase-one.mp4",
    provider: "provider-gateway",
    kind: "video",
    manifest: {
      local_path: "artifacts/run-123/asset-101.json",
      checksum: "sha256:render-xyz",
      file_size: 7_500_000,
      metadata: { resolution: "1080x1920", duration_seconds: 15 },
    },
  },
];

export const mockReviews: ReviewRecord[] = [
  {
    id: 1,
    decision: "approve",
    status: "completed",
    reviewer_role: "operator",
    notes: "Caption + voice review approved.",
    artifact_scope: "render",
    decided_at: now,
  },
];

export const mockAuditEvents: AuditEventRecord[] = [
  {
    id: 1,
    entity_type: "workflow",
    entity_id: "123",
    action: "ingest",
    actor: "system",
    payload: { detail: "Ingest finished" },
    created_at: now,
  },
  {
    id: 2,
    entity_type: "workflow",
    entity_id: "123",
    action: "review",
    actor: "operator-alex",
    payload: { detail: "Review approved" },
    created_at: now,
  },
];

export const mockProvenanceManifest: ProvenanceManifest = {
  run: {
    id: 123,
    project_id: 1,
    character_profile_id: 1,
    status: "completed",
    stage: "publish_prepare",
    review_status: "approved",
    requested_at: now,
    completed_at: now,
    workflow_metadata: {
      project_name: "project-mock-run",
      sourceType: "url",
      platforms: ["tiktok"],
      updatedAt: now,
    },
  },
  character: {
    id: 10,
    name: "Operator avatar",
    disclosed: true,
    persona: "Operator persona",
  },
  disclosure: {
    label: "Original synthetic character disclosed 2026-04-03",
    is_original: true,
    protected_identity: false,
  },
  assets: mockAssetReferences,
  provider_traces: mockProviderTraces,
  reviews: mockReviews,
  audits: mockAuditEvents,
};

export const mockExportManifest = {
  id: "bundle-001",
  path: "exports/run-123/manifest.json",
  checksum: "sha256:bundle-check",
  disclosure: mockProvenanceManifest.disclosure.label,
  reviewTrail: mockReviews.map((review) => review.notes ?? review.decision),
};
