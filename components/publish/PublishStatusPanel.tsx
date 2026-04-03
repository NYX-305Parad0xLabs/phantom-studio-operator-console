"use client";

import { Card } from "@/components/ui/card";
import { mockPublishJob, PublishAttemptStatus } from "@/lib/publish/mock";

const statusOrder: PublishAttemptStatus[] = [
  "prepared",
  "scheduled",
  "attempted",
  "succeeded",
  "failed",
];

const statusLabels: Record<PublishAttemptStatus, string> = {
  prepared: "Prepared",
  scheduled: "Scheduled",
  attempted: "Attempted",
  succeeded: "Succeeded",
  failed: "Failed",
};

export function PublishStatusPanel() {
  const { status, attempts } = mockPublishJob;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Publish status</p>
        <p className="text-sm font-semibold text-white uppercase tracking-[0.3em]">
          {statusLabels[status]}
        </p>
      </div>
      <div className="space-y-3">
        {statusOrder.map((step) => {
          const attempt = attempts.find((entry) => entry.status === step);
          const active = status === step || (!attempt && statusOrder.indexOf(status) > statusOrder.indexOf(step));
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
                  {new Date(attempt.timestamp).toLocaleTimeString()} · {attempt.detail}
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
