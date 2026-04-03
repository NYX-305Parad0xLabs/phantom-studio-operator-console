"use client";

import { Card } from "@/components/ui/card";
import { mockPublishJob } from "@/lib/publish/mock";

export function PublishHistory() {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Publish attempts</p>
        <p className="text-sm font-semibold text-white">Timeline</p>
      </div>
      <div className="space-y-3">
        {mockPublishJob.attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/50 p-4"
          >
            <p className="text-xs text-paradox-gray-400">
              {statusLabel(attempt.status)} · {new Date(attempt.timestamp).toLocaleString()}
            </p>
            <p className="text-sm text-paradox-gray-200">{attempt.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "prepared":
      return "Prepared";
    case "scheduled":
      return "Scheduled";
    case "attempted":
      return "Attempted";
    case "succeeded":
      return "Succeeded";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}
