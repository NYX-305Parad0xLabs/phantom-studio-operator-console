"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { FactoryDisclosureBanner } from "@/components/factory/FactoryDisclosureBanner";
import { FactoryStateBadge } from "@/components/factory/FactoryStateBadge";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryRunRecord,
  type FactoryUiStateLabel,
} from "@/lib/api/controlPlane";

function statusPercent(status: string) {
  switch (status) {
    case "queued":
      return 10;
    case "running":
      return 55;
    case "human_review":
      return 85;
    case "approved":
      return 100;
    case "completed":
      return 100;
    case "failed":
      return 100;
    case "rejected":
      return 100;
    default:
      return 0;
  }
}

export default function FactoryRunPage() {
  const params = useSearchParams();
  const runId = Number(params.get("runId") ?? "0");
  const initialState = (params.get("state") as FactoryUiStateLabel) ?? "mocked";
  const [state, setState] = useState<FactoryUiStateLabel>(initialState);
  const [run, setRun] = useState<FactoryRunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    let active = true;

    const fetchOnce = async () => {
      const result = await ControlPlaneClient.fetchFactoryRunRecord(runId);
      if (!active) return;
      setState(result.state);
      setRun(result.data);
      setError(result.error ?? null);
    };

    fetchOnce();
    const timer = setInterval(fetchOnce, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [runId]);

  const progress = useMemo(() => statusPercent(run?.status ?? "queued"), [run?.status]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Factory Run</h1>
        <FactoryStateBadge state={state} />
      </div>
      <FactoryDisclosureBanner />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!run ? (
        <Card className="p-6 text-paradox-gray-300">Loading run...</Card>
      ) : (
        <>
          <Card className="space-y-3 p-6">
            <p className="text-sm text-paradox-gray-200">Run ID: {run.id}</p>
            <p className="text-sm text-paradox-gray-200">Run status: {run.status}</p>
            <p className="text-sm text-paradox-gray-200">Provider status: {run.sync.provider_status ?? "n/a"}</p>
            <div className="h-3 overflow-hidden rounded-full bg-paradox-gray-800">
              <div
                className="h-full bg-paradox-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-paradox-gray-400">
              {run.status === "human_review"
                ? "Waiting for review"
                : run.status === "running"
                  ? "Provider job is running"
                  : `Current status: ${run.status}`}
            </p>
          </Card>

          <Card className="space-y-2 p-6">
            <h2 className="text-xl font-semibold text-white">Output preview</h2>
            <p className="text-sm text-paradox-gray-300">
              Video: {run.sync.stitched_video_uri ?? "Not available yet"}
            </p>
            <p className="text-sm text-paradox-gray-300">
              Metadata: {run.sync.metadata_uri ?? "Not available yet"}
            </p>
          </Card>

          <div className="flex gap-3">
            <Link
              href={`/factory/review?runId=${run.id}&state=${state}`}
              className="inline-flex items-center rounded-xl bg-paradox-accent px-4 py-2 text-sm font-semibold text-black"
            >
              Go to review
            </Link>
            <Link
              href={`/factory/export?runId=${run.id}&state=${state}`}
              className="inline-flex items-center rounded-xl border border-paradox-gray-700 px-4 py-2 text-sm text-paradox-gray-200"
            >
              View provenance/export
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
