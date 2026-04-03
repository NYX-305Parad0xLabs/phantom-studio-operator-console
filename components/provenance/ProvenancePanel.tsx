"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { controlPlaneBaseUrl, defaultWorkflowRunId, integrationMode } from "@/lib/config";
import {
  mockAssetReferences,
  mockAuditEvents,
  mockProvenanceManifest,
  mockProviderTraces,
} from "@/lib/provenance/mock";

const toPromptSummary = (trace: typeof mockProviderTraces[number]) => {
  const promptSpec = trace.prompt_spec as
    | { tokens?: number; confidence?: number | string }
    | null;
  return {
    id: `${trace.id}-${trace.created_at}`,
    stage: trace.stage,
    prompt: trace.prompt_text ?? JSON.stringify(trace.prompt_spec ?? {}),
    tokens: promptSpec?.tokens,
    confidence: promptSpec?.confidence,
    provider: `${trace.provider_name} · ${trace.provider_model}`,
    operator: trace.operator_identity ?? "operator",
  };
};

export function ProvenancePanel() {
  const runId = defaultWorkflowRunId;
  const usesLiveManifest = Boolean(controlPlaneBaseUrl) && integrationMode === "live" && runId > 0;

  const { data: provenance, isLoading, isError } = useQuery({
    queryKey: ["provenance", runId],
    queryFn: () => ControlPlaneClient.fetchProvenance(runId),
    enabled: usesLiveManifest,
    staleTime: Infinity,
  });

  const manifest = provenance?.manifest ?? mockProvenanceManifest;
  const checksum = provenance?.manifest_checksum ?? "sha256:provenance-placeholder";
  const manifestRunName = (manifest.run.workflow_metadata["project_name"] as string) ?? `Run ${manifest.run.id}`;
  const providerTraces = manifest.provider_traces.length ? manifest.provider_traces : mockProviderTraces;
  const promptArtifacts = useMemo(() => providerTraces.map((trace) => toPromptSummary(trace)), [providerTraces]);
  const assetReferences = manifest.assets.length ? manifest.assets : mockAssetReferences;
  const auditTimeline = manifest.audits.length ? manifest.audits : mockAuditEvents;
  const reviewTrail = manifest.reviews.length
    ? manifest.reviews.map((review) => `${review.decision} · ${review.notes ?? "no notes"}`)
    : ["Review trail pending"]; 

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Export manifest</p>
          <Badge variant={usesLiveManifest ? "success" : "muted"} className="text-[10px]">
            {usesLiveManifest ? "Live" : "Mock"}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-paradox-gray-200">Checksum: {checksum}</p>
          <p className="text-xs text-paradox-gray-400">Generated at: {manifest.run.requested_at}</p>
          <div className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/50 p-3">
            {isLoading && <p className="text-xs text-paradox-gray-400">Loading manifest...</p>}
            {isError && (
              <p className="text-xs text-paradox-amber">Live manifest unavailable; using mock fallback.</p>
            )}
            {!isLoading && (
              <pre className="max-h-48 overflow-auto text-[11px] text-paradox-gray-300">
                {JSON.stringify(manifest, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Provider traces</p>
          <Badge variant="muted" className="text-[10px]">
            {usesLiveManifest ? "Live" : "Mock"}
          </Badge>
        </div>
        <div className="space-y-4">
          {providerTraces.map((trace) => (
            <div
              key={trace.id}
              className="space-y-2 rounded-2xl border border-paradox-gray-700/70 bg-paradox-gray-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{trace.stage}</p>
                <span className="text-[11px] text-paradox-gray-400">{new Date(trace.created_at).toLocaleString()}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <p className="text-xs text-paradox-gray-400">
                  {trace.provider_name} · {trace.provider_model}
                </p>
                <p className="text-xs text-paradox-gray-400">{trace.operator_identity ?? "operator"}</p>
              </div>
              <p className="text-sm text-paradox-gray-200">{trace.prompt_text}</p>
              <div className="flex flex-wrap gap-2 text-xs text-paradox-gray-400">
                <span>Request: {JSON.stringify(trace.request_payload)}</span>
                <span>Response: {JSON.stringify(trace.response_payload)}</span>
                <span>Source assets: {trace.source_asset_ids.join(", ")}</span>
                <span>Generated: {trace.generated_asset_id}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Prompt artifacts</p>
          <div className="space-y-3">
            {promptArtifacts.map((prompt) => (
              <div key={prompt.id} className="rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3">
                <p className="text-sm font-semibold text-white">{prompt.stage}</p>
                <p className="text-xs text-paradox-gray-400">
                  tokens: {prompt.tokens ?? ""} · confidence {prompt.confidence ?? ""}
                </p>
                <p className="text-sm text-paradox-gray-200">{prompt.prompt}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Asset references</p>
          <div className="space-y-3">
            {assetReferences.map((asset) => (
              <div
                key={asset.id}
                className="rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3"
              >
                <p className="text-sm font-semibold text-white">{asset.asset_type}</p>
                <p className="text-xs text-paradox-gray-400">{asset.uri}</p>
                <p className="text-xs text-paradox-gray-400">Checksum: {asset.manifest.checksum}</p>
                <p className="text-xs text-paradox-gray-400">Asset metadata: {JSON.stringify(asset.manifest.metadata)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Audit events</p>
          <div className="space-y-3">
            {auditTimeline.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{event.action}</p>
                  <Badge variant="outline" className="text-[10px]">{event.actor}</Badge>
                </div>
                <p className="text-xs text-paradox-gray-400">{new Date(event.created_at).toLocaleString()}</p>
                <p className="text-sm text-paradox-gray-200">{JSON.stringify(event.payload)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Export bundle</p>
          <Badge variant={usesLiveManifest ? "success" : "muted"} className="text-[10px]">
            Manifest
          </Badge>
        </div>
        <div className="space-y-2 rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40 p-4">
          <p className="text-sm font-semibold text-white">{manifestRunName}</p>
          <p className="text-xs text-paradox-gray-400">{manifest.disclosure.label}</p>
          <p className="text-xs text-paradox-gray-400">Checksum: {checksum}</p>
          <div className="space-y-1 rounded-xl bg-paradox-gray-800/50 p-3 text-[12px]">
            <p className="text-[11px] uppercase tracking-[0.4em] text-paradox-gray-500">Review trail</p>
            {reviewTrail.map((item) => (
              <p key={item} className="text-sm text-paradox-gray-200">{item}</p>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
