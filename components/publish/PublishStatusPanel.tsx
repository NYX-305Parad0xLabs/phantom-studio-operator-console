"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePublishJobData } from "@/lib/publish/usePublishJob";

const statusOrder = [
  "prepared",
  "scheduled",
  "attempted",
  "succeeded",
  "failed",
] as const;

const statusLabels: Record<string, string> = {
  prepared: "Prepared",
  scheduled: "Scheduled",
  attempted: "Attempted",
  succeeded: "Succeeded",
  failed: "Failed",
};

export function PublishStatusPanel() {
  const { job, isMock } = usePublishJobData();
  const statusLabel = statusLabels[job.status] ?? job.status;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Publish status</p>
          <p className="text-sm font-semibold text-white uppercase tracking-[0.3em]">
            {statusLabel}
          </p>
        </div>
        {isMock && (
          <Badge variant="muted" className="text-[10px]">
            Mock fallback
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        {statusOrder.map((step) => {
          const attempt = job.attempts?.find((entry) => entry.status === step);
          const active = job.status === step;
          return (
            <div
              key={step}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                attempt
                  ? "border-paradox-emerald bg-paradox-gray-900/40"
                  : "border-paradox-gray-700 bg-paradox-gray-800/50"
              }`}
            >
              <p className="text-sm font-semibold text-white">{statusLabels[step]}</p>
              {attempt && (
                <p className="text-xs text-paradox-gray-400">
                  {new Date(attempt.attempted_at).toLocaleTimeString()} - {attempt.detail}
                </p>
              )}
              {!attempt && !active && (
                <p className="text-xs text-paradox-gray-500">pending</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
