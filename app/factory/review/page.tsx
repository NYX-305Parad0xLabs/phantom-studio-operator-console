"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { FactoryDisclosureBanner } from "@/components/factory/FactoryDisclosureBanner";
import { FactoryStateBadge } from "@/components/factory/FactoryStateBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryRunRecord,
  type FactoryUiStateLabel,
} from "@/lib/api/controlPlane";

function readReason(run: FactoryRunRecord | null): string {
  if (!run) return "None";
  const reason =
    run.sync.failure_reason ??
    (run.run_metadata["failure_reason"] as string | undefined) ??
    (run.run_metadata["provider_error"] as string | undefined) ??
    (run.run_metadata["rejection_notes"] as string | undefined);
  return reason && reason.trim().length > 0 ? reason : "None";
}

function FactoryReviewContent() {
  const params = useSearchParams();
  const runId = Number(params.get("runId") ?? "0");
  const [state, setState] = useState<FactoryUiStateLabel>(
    (params.get("state") as FactoryUiStateLabel) ?? "mocked",
  );
  const [run, setRun] = useState<FactoryRunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    if (!runId) return;
    let active = true;

    ControlPlaneClient.fetchFactoryRunRecord(runId).then((result) => {
      if (!active) return;
      setState(result.state);
      setRun(result.data);
      setError(result.error ?? null);
    });

    return () => {
      active = false;
    };
  }, [runId]);

  async function approve() {
    if (!run) return;
    setSubmitting("approve");
    const result = await ControlPlaneClient.approveFactoryRunRecord(run.id, notes);
    setSubmitting(null);
    setState(result.state);
    setRun(result.data);
    setError(result.error ?? null);
  }

  async function reject() {
    if (!run) return;
    setSubmitting("reject");
    const result = await ControlPlaneClient.rejectFactoryRunRecord(run.id, notes);
    setSubmitting(null);
    setState(result.state);
    setRun(result.data);
    setError(result.error ?? null);
  }

  const publishAllowed = Boolean(run?.run_metadata?.publish_prepare_allowed);
  const decisionLocked = run ? run.status !== "human_review" && run.status !== "approved" : true;
  const reason = useMemo(() => readReason(run), [run]);
  const disclosureText =
    (run?.run_metadata?.disclosure_text as string | undefined) ??
    "This is AI-generated synthetic content.";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Factory Review Gate</h1>
        <FactoryStateBadge state={state} />
      </div>

      <FactoryDisclosureBanner />

      {error ? <p className="text-sm text-rose-300">Something went wrong: {error}</p> : null}

      {!run ? (
        <Card className="p-6 text-paradox-gray-300">Loading review state...</Card>
      ) : (
        <>
          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-paradox-gray-300">Run status: {run.status}</p>
                <p className="text-sm text-paradox-gray-300">Review status: {run.review_status}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  publishAllowed
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                }`}
              >
                {publishAllowed ? "Publish unblocked" : "Publish blocked until approval"}
              </span>
            </div>

            <div className="rounded-xl border border-paradox-gray-800 bg-paradox-gray-900/50 p-4">
              <p className="text-sm font-semibold text-white">Disclosure summary</p>
              <p className="text-sm text-paradox-gray-300">{disclosureText}</p>
              <p className="mt-1 text-xs text-paradox-gray-400">
                Rights assertion and synthetic disclosure must remain visible before publish.
              </p>
            </div>

            <div className="rounded-xl border border-paradox-gray-800 bg-paradox-gray-900/50 p-4">
              <p className="text-sm font-semibold text-white">Failure/rejection reason</p>
              <p className="text-sm text-paradox-gray-300">{reason}</p>
            </div>

            <label className="block space-y-1">
              <span className="text-sm text-paradox-gray-200">Operator notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-24 w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
                placeholder="Add review notes for the audit trail"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button onClick={approve} disabled={decisionLocked || submitting !== null}>
                {submitting === "approve" ? "Approving..." : "Approve run"}
              </Button>
              <Button variant="outline" onClick={reject} disabled={decisionLocked || submitting !== null}>
                {submitting === "reject" ? "Rejecting..." : "Reject run"}
              </Button>
              {decisionLocked ? (
                <p className="text-xs text-paradox-gray-400">
                  Decisions are available only when the run is in human_review or already approved.
                </p>
              ) : null}
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

export default function FactoryReviewPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-paradox-gray-300">Loading review view...</div>}>
      <FactoryReviewContent />
    </Suspense>
  );
}
