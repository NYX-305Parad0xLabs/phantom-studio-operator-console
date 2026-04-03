"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { controlPlaneBaseUrl, defaultWorkflowRunId, integrationMode } from "@/lib/config";
import { mockProvenanceManifest } from "@/lib/provenance/mock";

export function ExportBundlePanel() {
  const runId = defaultWorkflowRunId;
  const usesLiveBackend = Boolean(controlPlaneBaseUrl) && integrationMode === "live" && runId > 0;

  const { data: exportBundle, isLoading: bundleLoading, isError: bundleError } = useQuery({
    queryKey: ["export-bundle", runId],
    queryFn: () => ControlPlaneClient.fetchExportBundle(runId),
    enabled: usesLiveBackend,
    staleTime: Infinity,
  });

  const { data: provenance } = useQuery({
    queryKey: ["provenance", runId],
    queryFn: () => ControlPlaneClient.fetchProvenance(runId),
    enabled: usesLiveBackend,
    staleTime: Infinity,
  });

  const bundle =
    exportBundle ?? {
      id: 0,
      workflow_run_id: runId,
      manifest_path: mockProvenanceManifest.assets[0]?.manifest.local_path ?? "",
      checksum: "",
      created_at: "",
    };

  const manifest = provenance?.manifest ?? mockProvenanceManifest;
  const reviewTrail = useMemo(
    () =>
      manifest.reviews.length
        ? manifest.reviews.map((review) => review.notes ?? review.decision)
        : ["Review trail pending"],
    [manifest.reviews],
  );

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Export bundle</p>
        <Badge variant={usesLiveBackend ? "success" : "muted"} className="text-[10px]">
          Manifest
        </Badge>
      </div>
      <div className="space-y-2 rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40 p-4">
        {bundleLoading && <p className="text-xs text-paradox-gray-400">Loading export bundle...</p>}
        {bundleError && (
          <p className="text-xs text-paradox-amber">Live export bundle unavailable; showing mock data.</p>
        )}
        <p className="text-sm font-semibold text-white">{bundle.manifest_path || "Manifest pending"}</p>
        <p className="text-xs text-paradox-gray-400">Checksum: {bundle.checksum || "pending"}</p>
        <p className="text-xs text-paradox-gray-400">Disclosure: {manifest.disclosure.label ?? "Original synthetic"}</p>
        <div className="space-y-1 rounded-xl bg-paradox-gray-800/50 p-3 text-[12px]">
          <p className="text-[11px] uppercase tracking-[0.4em] text-paradox-gray-500">Review trail</p>
          {reviewTrail.map((item) => (
            <p key={item} className="text-sm text-paradox-gray-200">
              {item}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}
