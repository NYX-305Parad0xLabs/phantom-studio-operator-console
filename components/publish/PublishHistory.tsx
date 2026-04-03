"use client";

import { Card } from "@/components/ui/card";
import { usePublishJobData } from "@/lib/publish/usePublishJob";

const statusLabel = (status: string) => {
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
};

export function PublishHistory() {
  const { job, isMock } = usePublishJobData();

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Publish attempts</p>
        <p className="text-sm font-semibold text-white">Timeline</p>
      </div>
      {isMock && (
        <p className="text-xs text-paradox-gray-500">Showing mock history until live publish jobs are available.</p>
      )}
      <div className="space-y-3">
        {job.attempts?.map((attempt) => (
          <div
            key={attempt.id}
            className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/50 p-4"
          >
            <p className="text-xs text-paradox-gray-400">
              {statusLabel(attempt.status)} - {new Date(attempt.attempted_at).toLocaleString()}
            </p>
            <p className="text-sm text-paradox-gray-200">{attempt.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
