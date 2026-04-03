"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { defaultWorkflowRunId, integrationMode } from "@/lib/config";
import {
  mockAuditEvents,
  mockAssetReferences,
  mockPromptArtifacts,
  mockProviderTraces,
} from "@/lib/provenance/mock";

export function ProvenancePanel() {
  const runId = defaultWorkflowRunId;
  const usesLive = integrationMode === "live" && runId > 0;
  const { data: provenance, isLoading, isError } = useQuery({
    queryKey: ["provenance", runId],
    queryFn: () => ControlPlaneClient.fetchProvenance(runId),
    enabled: usesLive,
  });

  const manifest = provenance ?? {
    manifest: { note: "Mock manifest placeholder" },
    manifest_checksum: "sha256:mock-manifest",
    created_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Export manifest</p>
          <Badge variant={usesLive ? "success" : "muted"} className="text-[10px]">
            {usesLive ? "Live" : "Mock"}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-paradox-gray-200">
            Checksum: {manifest.manifest_checksum}
          </p>
          <p className="text-xs text-paradox-gray-400">
            Generated at: {new Date(manifest.created_at).toLocaleString()}
          </p>
          <div className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/50 p-3">
            {isLoading && <p className="text-xs text-paradox-gray-400">Loading manifest...</p>}
            {isError && (
              <p className="text-xs text-paradox-amber">Live manifest unavailable; using mock fallback.</p>
            )}
            {!isLoading && !isError && (
              <pre className="max-h-48 overflow-auto text-[11px] text-paradox-gray-300">
                {JSON.stringify(manifest.manifest, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Provider traces</p>
          <Badge variant="muted" className="text-[10px]">
            Mock fallback
          </Badge>
        </div>
        <div className="space-y-4">
          {mockProviderTraces.map((trace) => (
            <div key={trace.id} className="space-y-2 rounded-2xl border border-paradox-gray-700/70 bg-paradox-gray-900/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{trace.stage}</p>
                <span className="text-[11px] text-paradox-gray-400">{new Date(trace.timestamp).toLocaleString()}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <p className="text-xs text-paradox-gray-400">
                  {trace.provider} · {trace.model} · operator {trace.operator}
                </p>
                <p className="text-xs text-paradox-gray-400">{trace.requestMeta}</p>
              </div>
              <p className="text-sm text-paradox-gray-200">{trace.promptSummary}</p>
              <div className="flex flex-wrap gap-2 text-xs text-paradox-gray-400">
                <span>{trace.responseMeta}</span>
                <span>Sources: {trace.sourceAssets.join(", ")}</span>
                <span>Generated: {trace.generatedAssets.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Prompt artifacts</p>
          <div className="space-y-3">
            {mockPromptArtifacts.map((prompt) => (
              <div key={prompt.id} className="rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3">
                <p className="text-sm font-semibold text-white">{prompt.stage}</p>
                <p className="text-xs text-paradox-gray-400">tokens: {prompt.tokens} · confidence {prompt.confidence}</p>
                <p className="text-sm text-paradox-gray-200">{prompt.prompt}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Asset references</p>
          <div className="space-y-3">
            {mockAssetReferences.map((asset) => (
              <div key={asset.id} className="rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3">
                <p className="text-sm font-semibold text-white">{asset.label}</p>
                <p className="text-xs text-paradox-gray-400">{asset.path}</p>
                <p className="text-xs text-paradox-gray-400">{asset.checksum}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Audit events</p>
          <div className="space-y-3">
            {mockAuditEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{event.type}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {event.actor}
                  </Badge>
                </div>
                <p className="text-xs text-paradox-gray-400">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
                <p className="text-sm text-paradox-gray-200">{event.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
