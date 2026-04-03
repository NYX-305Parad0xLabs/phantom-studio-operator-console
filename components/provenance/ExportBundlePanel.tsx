"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockExportManifest } from "@/lib/provenance/mock";

export function ExportBundlePanel() {
  const { path, checksum, disclosure, reviewTrail } = mockExportManifest;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Export bundle</p>
        <Badge variant="muted" className="text-[10px]">
          Manifest
        </Badge>
      </div>
      <div className="space-y-2 rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40 p-4">
        <p className="text-sm font-semibold text-white">{path}</p>
        <p className="text-xs text-paradox-gray-400">{checksum}</p>
        <p className="text-xs text-paradox-gray-400">{disclosure}</p>
        <div className="space-y-1 rounded-xl bg-paradox-gray-800/50 p-3 text-[12px]">
          <p className="text-[11px] uppercase tracking-[0.4em] text-paradox-gray-500">
            Review trail
          </p>
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
