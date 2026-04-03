"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { ProviderGatewayClient } from "@/lib/api/providerGateway";
import {
  controlPlaneBaseUrl,
  defaultProviderRenderId,
  defaultWorkflowRunId,
  integrationMode,
  providerGatewayBaseUrl,
} from "@/lib/config";
import { mockRenderSummary } from "@/lib/export/mockRender";


type ReadinessState = {
  label: string;
  detail: string;
  state: "ready" | "blocked";
};

const statusBadgeVariant = (state: "ready" | "blocked"): "success" | "muted" =>
  (state === "ready" ? "success" : "muted");

const layerNames: Record<string, string> = {
  clip_trim: "Base clip",
  caption_overlay: "Caption overlay",
  translation: "Translation layer",
  voice_track: "Voice mix",
  lipsync: "Lip-sync overlay",
  export_render: "Export render",
};

const formatDuration = (seconds?: number) => {
  if (seconds == null || Number.isNaN(seconds)) {
    return "00:00";
  }
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
};

const extractPathName = (value?: string) => {
  if (!value) return "manifest";
  const segments = value.split("/");
  return segments[segments.length - 1] || value;
};

export function ExportReviewPanel() {
  const renderId = defaultProviderRenderId;
  const runId = defaultWorkflowRunId;

  const renderQuery = useQuery({
    queryKey: ["render-summary", renderId],
    queryFn: () => ProviderGatewayClient.fetchRenderSummary(renderId),
    staleTime: Infinity,
  });

  const exportQuery = useQuery({
    queryKey: ["export-bundle", runId],
    queryFn: () => ControlPlaneClient.fetchExportBundle(runId),
    staleTime: Infinity,
  });

  const renderSummary = renderQuery.data ?? mockRenderSummary;
  const exportBundle =
    exportQuery.data ?? {
      id: 0,
      workflow_run_id: 0,
      manifest_path: "",
      checksum: "",
      created_at: "",
    };

  const publishReady = renderSummary.publish_ready;
  const spec = renderSummary.spec;

  const hasLiveRender =
    Boolean(providerGatewayBaseUrl) &&
    integrationMode === "live" &&
    renderId > 0 &&
    !renderQuery.isError;
  const hasLiveBundle =
    Boolean(controlPlaneBaseUrl) &&
    integrationMode === "live" &&
    runId > 0 &&
    !exportQuery.isError;
  const dataBannerLabel = hasLiveRender && hasLiveBundle ? "Live data" : "Mock fallback";

  const videoLabel = publishReady?.title ?? "Rendered short";
  const durationLabel = formatDuration(renderSummary.output.duration_seconds);
  const resolutionLabel = spec?.resolution ?? spec?.aspect_ratio ?? "Unknown resolution";
  const captionFile = {
    name: extractPathName(renderSummary.output.caption_text_path),
    status: publishReady ? "generated" : "pending",
  };

  const captionJsonPreview = useMemo(
    () => ({
      path: renderSummary.output.caption_json_path,
      metadata: {
        spec: spec?.name ?? "Render preset",
        duration_seconds: renderSummary.output.duration_seconds,
        manifest: exportBundle.manifest_path,
      },
    }),
    [renderSummary.output.caption_json_path, renderSummary.output.duration_seconds, spec?.name, exportBundle.manifest_path],
  );

  const layers = renderSummary.layers.length
    ? renderSummary.layers.map((layer) => {
        const detailSource = (layer.metadata_json?.note ?? layer.metadata_json?.description) as string | undefined;
        const detail =
          typeof detailSource === "string"
            ? detailSource
            : JSON.stringify(layer.metadata_json ?? { created_at: layer.created_at });
        return {
          name: layerNames[layer.layer_type] ?? layer.layer_type.replace(/_/g, " "),
          detail,
          status: "complete" as const,
        };
      })
    : [
        {
          name: "Render pipeline",
          detail: "Layer metadata pending",
          status: "pending",
        },
      ];

  const suggestions = {
    title: publishReady?.title ?? "Title pending",
    caption: publishReady?.caption ?? "Caption pending",
    hashtags: publishReady?.hashtags ?? [],
  };

  const readiness: ReadinessState[] = [
    {
      label: "Approval state",
      detail: publishReady
        ? "Human review intent recorded"
        : "Awaiting QA + approval decision",
      state: publishReady ? "ready" : "blocked",
    },
    {
      label: "Disclosure state",
      detail: exportBundle.manifest_path
        ? "Manifest stores disclosure metadata"
        : "Disclosure record pending",
      state: exportBundle.manifest_path ? "ready" : "blocked",
    },
    {
      label: "Export bundle state",
      detail: exportBundle.manifest_path
        ? `Manifest ${extractPathName(exportBundle.manifest_path)}`
        : "Manifest not generated",
      state: exportBundle.manifest_path ? "ready" : "blocked",
    },
    {
      label: "Policy state",
      detail: exportBundle.checksum
        ? `Checksum ${exportBundle.checksum}`
        : "Policy checks not recorded",
      state: exportBundle.checksum ? "ready" : "blocked",
    },
  ];

  const statusIndicators: ReadinessState[] = [
    {
      label: publishReady ? "Ready for human approval" : "Render pending human review",
      state: publishReady ? "ready" : "blocked",
      detail: publishReady ? "Title + caption ready" : "Waiting on captions",
    },
    {
      label: exportBundle.manifest_path ? "Manifest recorded" : "Manifest missing",
      state: exportBundle.manifest_path ? "ready" : "blocked",
      detail: exportBundle.manifest_path
        ? `Checksum ${exportBundle.checksum}`
        : "Bundle not exported yet",
    },
    {
      label: dataBannerLabel,
      state: hasLiveRender && hasLiveBundle ? "ready" : "blocked",
      detail: hasLiveRender && hasLiveBundle
        ? "Provider + control-plane reads active"
        : "Using fallback dataset",
    },
  ];

  const viralityRationale = publishReady?.rationale ??
    spec?.metadata_json?.notes ??
    "Live render ready for human review.";

  const preset = {
    name: spec?.name ?? "Render preset",
    aspect: spec?.aspect_ratio ?? spec?.resolution ?? "portrait",
    codec: spec?.metadata_json?.codec ?? "H.264",
    captionFormats: (spec?.metadata_json?.captionFormats as string[] | undefined) ?? ["JSON", "SRT"],
    notes: spec?.metadata_json?.notes ?? "Live provider export spec",
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Render summary</p>
            <p className="text-xl font-semibold text-white">{videoLabel}</p>
            <p className="text-xs text-paradox-gray-400">
              {durationLabel}  {resolutionLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={hasLiveRender ? "outline" : "muted"} className="text-[10px]">
              {hasLiveRender ? "Live render" : "Mock render"}
            </Badge>
            <Badge variant={hasLiveBundle ? "outline" : "muted"} className="text-[10px]">
              {hasLiveBundle ? "Live export" : "Mock export"}
            </Badge>
          </div>
        </div>

        <div className="rounded-3xl border border-paradox-gray-700/70 bg-black/40 p-4">
          <div className="aspect-video rounded-2xl border border-paradox-gray-700/80 bg-gradient-to-t from-black via-paradox-gray-900 to-black p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Video preview</p>
            <p className="text-sm text-paradox-gray-400">
              {publishReady?.caption ?? "Final short wrapped with bold captions + synthetic voiceover"}
            </p>
          </div>
          <div className="mt-3 text-xs text-paradox-gray-400">
            This preview summarizes the render output stored by the provider gateway.
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Render layers</p>
            <Badge variant="outline" className="text-[10px]">
              {layers.filter((layer) => layer.status === "complete").length}/{layers.length} complete
            </Badge>
          </div>
          <div className="space-y-3">
            {layers.map((layer) => (
              <div
                key={layer.name}
                className={cn(
                  "rounded-2xl border px-4 py-3",
                  layer.status === "complete"
                    ? "border-paradox-gray-700 bg-paradox-gray-900/40"
                    : "border-paradox-amber/60 bg-paradox-amber/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{layer.name}</p>
                  <Badge variant={layer.status === "complete" ? "success" : "muted"}>
                    {layer.status === "complete" ? "Complete" : "Pending"}
                  </Badge>
                </div>
                <p className="text-xs text-paradox-gray-400">{layer.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3 border border-paradox-gray-700/80">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-paradox-gray-400">Export preset</p>
            <p className="text-lg font-semibold text-white">{preset.name}</p>
            <p className="text-xs text-paradox-gray-400">
              {String(preset.aspect)}  {String(preset.codec)}
            </p>
            <p className="text-xs text-paradox-gray-500">
              Captions: {preset.captionFormats.join(" / ")}
            </p>
            <p className="text-xs text-paradox-gray-400">{String(preset.notes)}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="text-[11px]" variant="outline">
                Download {captionFile.name}
              </Button>
              <Badge variant="muted" className="text-[10px]">
                {captionFile.status}
              </Badge>
            </div>
          </Card>

          <Card className="space-y-3 border border-paradox-gray-700/80">
            <p className="text-sm font-semibold text-white">Caption JSON</p>
            <pre className="max-h-40 overflow-auto rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/60 p-3 text-[11px] text-paradox-gray-300">
              {JSON.stringify(captionJsonPreview, null, 2)}
            </pre>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 border border-paradox-gray-700/80">
          <p className="text-sm font-semibold text-white">Suggested title</p>
          <p className="text-base text-paradox-emerald">{suggestions.title}</p>
        </Card>
        <Card className="space-y-3 border border-paradox-gray-700/80">
          <p className="text-sm font-semibold text-white">Suggested caption</p>
          <p className="text-sm text-paradox-gray-200">{suggestions.caption}</p>
        </Card>
        <Card className="space-y-3 border border-paradox-gray-700/80">
          <p className="text-sm font-semibold text-white">Hashtags</p>
          <p className="text-sm text-paradox-gray-200">{suggestions.hashtags.join(" ") || "#rendering"}</p>
        </Card>
      </div>

      <Card className="space-y-3 border border-paradox-gray-700/80">
        <p className="text-sm font-semibold text-white">Virality rationale</p>
        <p className="text-sm text-paradox-gray-200">{String(viralityRationale)}</p>
      </Card>

      <Card className="space-y-4 border border-paradox-gray-700/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Publish readiness</p>
          <div className="flex flex-wrap gap-2">
            {statusIndicators.map((indicator) => (
              <Badge
                key={indicator.label}
                variant={statusBadgeVariant(indicator.state)}
                className="text-[10px]"
              >
                {indicator.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {readiness.map((state) => (
            <div
              key={state.label}
              className="space-y-2 rounded-2xl border border-paradox-gray-700/70 bg-paradox-gray-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
                  {state.label}
                </p>
                <Badge variant={state.state === "ready" ? "accent" : "outline"}>
                  {state.state === "ready" ? "Ready" : "Blocked"}
                </Badge>
              </div>
              <p className="text-sm text-paradox-gray-200">{state.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
