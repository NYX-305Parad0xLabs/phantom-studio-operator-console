"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { FactoryDisclosureBanner } from "@/components/factory/FactoryDisclosureBanner";
import { FactoryStateBadge } from "@/components/factory/FactoryStateBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryRunRecord,
  type FactoryUiStateLabel,
} from "@/lib/api/controlPlane";

export default function FactoryReviewPage() {
  const params = useSearchParams();
  const runId = Number(params.get("runId") ?? "0");
  const [state, setState] = useState<FactoryUiStateLabel>(
    (params.get("state") as FactoryUiStateLabel) ?? "mocked",
  );
  const [run, setRun] = useState<FactoryRunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!runId) return;
    ControlPlaneClient.fetchFactoryRunRecord(runId).then((result) => {
      setState(result.state);
      setRun(result.data);
      setError(result.error ?? null);
    });
  }, [runId]);

  async function approve() {
    if (!run) return;
    const result = await ControlPlaneClient.approveFactoryRunRecord(run.id, notes);
    setState(result.state);
    setRun(result.data);
    setError(result.error ?? null);
  }

  async function reject() {
    if (!run) return;
    const result = await ControlPlaneClient.rejectFactoryRunRecord(run.id, notes);
    setState(result.state);
    setRun(result.data);
    setError(result.error ?? null);
  }

  const publishAllowed = Boolean(run?.run_metadata?.publish_prepare_allowed);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Factory Review Gate</h1>
        <FactoryStateBadge state={state} />
      </div>

      <FactoryDisclosureBanner />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!run ? (
        <Card className="p-6 text-paradox-gray-300">Loading review state...</Card>
      ) : (
        <>
          <Card className="space-y-3 p-6">
            <p className="text-sm text-paradox-gray-300">Run status: {run.status}</p>
            <p className="text-sm text-paradox-gray-300">Review status: {run.review_status}</p>
            <p className="text-sm text-paradox-gray-300">
              Publish state: {publishAllowed ? "Unblocked after approval" : "Blocked pending approval"}
            </p>

            <label className="block space-y-1">
              <span className="text-sm text-paradox-gray-200">Review notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
              />
            </label>

            <div className="flex gap-3">
              <Button onClick={approve} disabled={run.status !== "human_review" && run.status !== "approved"}>
                Approve run
              </Button>
              <Button variant="outline" onClick={reject}>
                Reject run
              </Button>
            </div>
          </Card>

          <Card className="space-y-2 p-6">
            <h2 className="text-lg font-semibold text-white">Returned outputs</h2>
            <p className="text-sm text-paradox-gray-300">Video URI: {run.sync.stitched_video_uri ?? "n/a"}</p>
            <p className="text-sm text-paradox-gray-300">Metadata URI: {run.sync.metadata_uri ?? "n/a"}</p>
          </Card>

          <Link
            href={`/factory/export?runId=${run.id}&state=${state}`}
            className="inline-flex items-center rounded-xl border border-paradox-gray-700 px-4 py-2 text-sm text-paradox-gray-200"
          >
            Continue to provenance/export
          </Link>
        </>
      )}
    </div>
  );
}
