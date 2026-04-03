export type ProviderTraceRecord = {
  id: number | string;
  stage: string;
  provider_name: string;
  provider_model: string;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  prompt_text: string | null;
  prompt_spec: Record<string, unknown> | null;
  source_asset_ids: number[];
  generated_asset_id: number | null;
  operator_identity: string | null;
  created_at: string;
};

export type ProvenanceAssetManifest = {
  local_path: string;
  checksum: string;
  file_size: number;
  metadata: Record<string, unknown>;
};

export type ProvenanceAssetEntry = {
  id: number;
  asset_type: string;
  uri: string;
  provider: string;
  kind: string;
  manifest: ProvenanceAssetManifest;
};

export type ReviewRecord = {
  id: number;
  decision: string;
  status: string;
  reviewer_role: string;
  notes: string | null;
  artifact_scope: string | null;
  decided_at: string;
};

export type AuditEventRecord = {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type DisclosureRecord = {
  label: string | null;
  is_original: boolean | null;
  protected_identity: boolean | null;
};

export type RunMetadataRecord = {
  id: number;
  project_id: number;
  character_profile_id: number;
  status: string;
  stage: string;
  review_status: string;
  requested_at: string;
  completed_at: string | null;
  workflow_metadata: Record<string, unknown>;
};

export type CharacterRecord = {
  id: number | null;
  name: string | null;
  disclosed: boolean | null;
  persona: string | null;
};

export type ProvenanceManifest = {
  run: RunMetadataRecord;
  character: CharacterRecord;
  disclosure: DisclosureRecord;
  assets: ProvenanceAssetEntry[];
  provider_traces: ProviderTraceRecord[];
  reviews: ReviewRecord[];
  audits: AuditEventRecord[];
};
