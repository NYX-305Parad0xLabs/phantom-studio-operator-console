"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useJobStatusStore } from "@/lib/store/jobStatusStore";

export function TopBar() {
  const { currentJobId, status, updatedAt } = useJobStatusStore();

  const statusLabel = useMemo(() => {
    switch (status) {
      case "running":
        return "Processing";
      case "queued":
        return "Queued";
      default:
        return "Idle";
    }
  }, [status]);

  return (
    <header className="flex items-center justify-between border-b border-paradox-gray-800/80 px-6 py-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.5em] text-paradox-gray-500">
          Operator Console
        </p>
        <h1 className="text-lg font-semibold text-white">Creator Workflows</h1>
      </div>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-paradox-gray-700 px-4 py-2 text-xs uppercase tracking-[0.3em]",
          )}
        >
          <span className="text-paradox-gray-400">Job status</span>
          <Badge
            variant={status === "running" ? "accent" : status === "queued" ? "muted" : "muted"}
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-xs text-paradox-gray-400">Job ID</p>
          <p className="text-sm font-semibold text-white">{currentJobId ?? "--"}</p>
          <p className="text-[11px] text-paradox-gray-500" suppressHydrationWarning>
            Updated {new Date(updatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </header>
  );
}
