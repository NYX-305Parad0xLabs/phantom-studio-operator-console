"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { getStageLabel, statusBadgeMap, RunStageStatus } from "@/lib/runs/status";

export default function RunDetailPage() {
  const params = useParams();
  const runIdParam = Array.isArray(params?.runId) ? params.runId[0] : params?.runId;

  const runQuery = useQuery({
    queryKey: ["run", runIdParam],
    queryFn: () => ControlPlaneClient.fetchRun(runIdParam ?? ""),
    enabled: Boolean(runIdParam),
    refetchInterval: 10_000,
  });

  const timeline = useMemo(() => runQuery.data?.stages ?? [], [runQuery.data]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          Run detail
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Run {runIdParam ?? "—"}
        </h1>
        <p className="text-sm text-paradox-gray-400">
          Follow each stage from ingest to review/publish prep.
        </p>
      </div>

      <Card className="space-y-4">
        {!timeline.length && (
          <p className="text-sm text-paradox-gray-400">Loading timeline…</p>
        )}
        <div className="space-y-3">
            {timeline.map((stage) => {
              const status = (stage.status as RunStageStatus) ?? "pending";
              return (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {getStageLabel(stage.stage)}
                    </p>
                  <p className="text-xs text-paradox-gray-500">
                    Started {new Date(stage.startedAt).toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant={statusBadgeMap[status]}>
                  {status.toUpperCase()}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
