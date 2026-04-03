"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  mockAuditEvents,
  mockAssetReferences,
  mockPromptArtifacts,
  mockProviderTraces,
} from "@/lib/provenance/mock";

export function ProvenancePanel() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Provider traces</p>
          <Badge variant="muted" className="text-[10px]">
            {mockProviderTraces.length} entries
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
