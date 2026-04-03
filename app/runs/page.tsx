"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { statusBadgeMap, runStageOrder, RunStage, RunStageStatus } from "@/lib/runs/status";

const stageFilters: (RunStage | "all")[] = ["all", ...runStageOrder];
const statusFilters = ["all", "ready", "running", "queued", "blocked", "error"] as const;

export default function RunsPage() {
  const [stageFilter, setStageFilter] = useState<RunStage | "all">("all");
  const [statusFilter, setStatusFilter] = useState<typeof statusFilters[number]>("all");
  const [projectFilter, setProjectFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "url" | "upload">("all");

  const runsQuery = useQuery({
    queryKey: ["runs"],
    queryFn: ControlPlaneClient.listRuns,
    refetchInterval: 10_000,
  });

  const filteredRuns = useMemo(() => {
    let runs = runsQuery.data ?? [];
    if (stageFilter !== "all") {
      runs = runs.filter((run) => run.stage === stageFilter);
    }
    if (statusFilter !== "all") {
      runs = runs.filter((run) => run.status === statusFilter);
    }
    if (projectFilter) {
      runs = runs.filter((run) =>
        run.project.toLowerCase().includes(projectFilter.toLowerCase()),
      );
    }
    if (sourceFilter !== "all") {
      runs = runs.filter((run) => run.sourceType === sourceFilter);
    }
    return runs;
  }, [runsQuery.data, stageFilter, statusFilter, projectFilter, sourceFilter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          Runs
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Workflow run dashboard
        </h1>
        <p className="text-sm text-paradox-gray-400">
          Track every stage from ingest through review/publish prep.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
            Stage
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value as RunStage | "all")}
              className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            >
              {stageFilters.map((stage) => (
                <option key={stage} value={stage}>
                  {stage === "all" ? "All" : stage}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilters[number])}
              className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All" : status}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
            Project
            <input
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              placeholder="Search project"
              className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
            Source type
            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value as "all" | "url" | "upload")
              }
              className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            >
              <option value="all">All</option>
              <option value="url">URL</option>
              <option value="upload">Upload</option>
            </select>
          </label>
        </div>

        <div className="overflow-auto">
          <table className="w-full table-auto border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
                <th className="px-3 py-2">Run</th>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Platforms</th>
              </tr>
            </thead>
            <tbody>
              {(filteredRuns.length === 0 ? runsQuery.data ?? [] : filteredRuns).map(
                (run) => (
                  <tr key={run.id} className="border-t border-paradox-gray-800/80">
                    <td className="px-3 py-3">
                      <Link
                        href={`/runs/${run.id}`}
                        className="font-semibold text-paradox-emerald hover:underline"
                      >
                        {run.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{run.project}</td>
                    <td className="px-3 py-3 capitalize">{run.sourceType}</td>
                    <td className="px-3 py-3">
                      {run.stage}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={statusBadgeMap[mapRunStatus(run.status)]}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      {new Date(run.updatedAt || "").toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-3">
                      {run.platforms?.join(", ") ?? "—"}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function mapRunStatus(status: string): RunStageStatus {
  if (status === "ready") return "complete";
  if (status === "running") return "running";
  if (status === "blocked") return "blocked";
  if (status === "error") return "failed";
  return "pending";
}
