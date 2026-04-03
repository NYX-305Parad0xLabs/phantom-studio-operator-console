"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockExportReview } from "@/lib/export/mockReview";

const statusBadgeVariant = (state: "ready" | "blocked") =>
  state === "ready" ? "success" : "muted";

export function ExportReviewPanel() {
  const {
    videoLabel,
    durationLabel,
    resolution,
    previewText,
    layers,
    preset,
    captionFile,
    captionJson,
    suggestions,
    viralityRationale,
    readiness,
    statusIndicators,
  } = mockExportReview;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
              Render summary
            </p>
            <p className="text-xl font-semibold text-white">{videoLabel}</p>
            <p className="text-xs text-paradox-gray-400">
              {durationLabel} • {resolution}
            </p>
          </div>
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

        <div className="rounded-3xl border border-paradox-gray-700/70 bg-black/40 p-4">
          <div className="aspect-video rounded-2xl border border-paradox-gray-700/80 bg-gradient-to-t from-black via-paradox-gray-900 to-black p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
              Video preview
            </p>
            <p className="text-sm text-paradox-gray-400">{previewText}</p>
          </div>
          <div className="mt-3 text-xs text-paradox-gray-400">
            This preview is mock content representing the rendered short-form asset.
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Render layers</p>
            <Badge variant="outline" className="text-[10px]">
              {layers.filter((layer) => layer.status === "complete").length}/
              {layers.length} complete
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-paradox-gray-400">
              Export preset
            </p>
            <p className="text-lg font-semibold text-white">{preset.name}</p>
            <p className="text-xs text-paradox-gray-400">
              {preset.aspect} • {preset.codec}
            </p>
            <p className="text-xs text-paradox-gray-500">
              Captions: {preset.captionFormats.join(" / ")}
            </p>
            <p className="text-xs text-paradox-gray-400">{preset.notes}</p>
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
              {JSON.stringify(captionJson, null, 2)}
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
          <p className="text-sm text-paradox-gray-200">{suggestions.hashtags.join(" ")}</p>
        </Card>
      </div>

      <Card className="space-y-3 border border-paradox-gray-700/80">
        <p className="text-sm font-semibold text-white">Virality rationale</p>
        <p className="text-sm text-paradox-gray-200">{viralityRationale}</p>
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
