"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { FactoryDisclosureBanner } from "@/components/factory/FactoryDisclosureBanner";
import { FactoryStateBadge } from "@/components/factory/FactoryStateBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryDiagnosticsSummary,
  type FactoryRunRecord,
  type FactoryUiStateLabel,
} from "@/lib/api/controlPlane";

type TimelineEntry = {
  id: string;
  at: string;
  from: string;
  to: string;
  reason: string;
  actor: string;
};

const POLL_BASE_MS = 2_000;
const POLL_MAX_MS = 12_000;

function statusPercent(status: string) {
  switch (status) {
    case "queued":
      return 10;
    case "running":
      return 55;
    case "partial":
      return 70;
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

function progressMessage(status: string) {
  switch (status) {
    case "queued":
      return "Queued for provider execution.";
    case "running":
      return "Provider is generating scenes.";
    case "partial":
      return "Partial output returned. Operator review required.";
    case "human_review":
      return "Run reached human-review gate.";
    case "approved":
      return "Approved. Publish preparation is unblocked.";
    case "failed":
      return "Run failed. Review provider reason and retry if safe.";
    case "rejected":
      return "Run rejected by operator.";
    default:
      return `Current status: ${status}`;
  }
}

function parseTimeline(run: FactoryRunRecord | null): TimelineEntry[] {
  if (!run) return [];
  const fromTrail = run.run_metadata?.transition_trail;
  if (Array.isArray(fromTrail) && fromTrail.length > 0) {
    return fromTrail
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const row = entry as Record<string, unknown>;
        return {
          id: `trail-${index}`,
          at: String(row["at"] ?? run.updated_at),
          from: String(row["from"] ?? "unknown"),
          to: String(row["to"] ?? "unknown"),
          reason: String(row["reason"] ?? "unspecified"),
          actor: String(row["actor"] ?? "system"),
        };
      })
      .filter((entry): entry is TimelineEntry => Boolean(entry))
      .reverse();
  }

  return run.events
    .filter((event) => event.event_type === "status_transition")
    .map((event, index) => ({
      id: `event-${event.id}-${index}`,
      at: event.created_at,
      from: String(event.payload["from"] ?? "unknown"),
      to: String(event.payload["to"] ?? "unknown"),
      reason: String(event.payload["reason"] ?? "unspecified"),
      actor: event.actor ?? "system",
    }))
    .reverse();
}

function getProviderError(run: FactoryRunRecord | null): string | null {
  if (!run) return null;
  const failureFromSync = run.sync.failure_reason;
  if (failureFromSync) return failureFromSync;
  const metadata = run.run_metadata ?? {};
  const failure = metadata["failure_reason"] ?? metadata["provider_error"] ?? metadata["last_sync_error"];
  if (typeof failure === "string" && failure.trim().length > 0) {
    return failure;
  }
  return null;
}

function getBackendMode(run: FactoryRunRecord | null, state: FactoryUiStateLabel): "live" | "mock" {
  if (state !== "live" && state !== "waiting_for_review") {
    return "mock";
  }
  const mode = run?.run_metadata?.provider_mode;
  if (typeof mode === "string" && mode.toLowerCase().includes("stub")) {
    return "mock";
  }
  return "live";
}

function FactoryRunContent() {
  const params = useSearchParams();
  const runId = Number(params.get("runId") ?? "0");
  const initialState = (params.get("state") as FactoryUiStateLabel) ?? "mocked";

  const [state, setState] = useState<FactoryUiStateLabel>(initialState);
  const [run, setRun] = useState<FactoryRunRecord | null>(null);
  const [diagnostics, setDiagnostics] = useState<FactoryDiagnosticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollDelay, setPollDelay] = useState(POLL_BASE_MS);
  const [pollingPaused, setPollingPaused] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [lastTickMs, setLastTickMs] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    if (!runId) return;

    const [runResult, diagResult] = await Promise.all([
      ControlPlaneClient.fetchFactoryRunRecord(runId),
      ControlPlaneClient.fetchFactoryDiagnostics(),
    ]);

    setState(runResult.state);
    setRun(runResult.data);
    setDiagnostics(diagResult.data);
    setLastTickMs(Date.now());

    if (runResult.error || diagResult.error) {
      setError(runResult.error ?? diagResult.error ?? null);
      setPollDelay((current) => Math.min(POLL_MAX_MS, current * 2));
      return;
    }

    setError(null);
    setPollDelay(POLL_BASE_MS);
  }, [runId]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (!active || pollingPaused) return;
      await refresh();
      if (!active || pollingPaused) return;
      timer = setTimeout(tick, pollDelay);
    };

    void tick();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [pollDelay, pollingPaused, refresh]);

  const progress = useMemo(() => statusPercent(run?.status ?? "queued"), [run?.status]);
  const timeline = useMemo(() => parseTimeline(run), [run]);
  const providerError = useMemo(() => getProviderError(run), [run]);
  const backendMode = useMemo(() => getBackendMode(run, state), [run, state]);

  const staleSeconds = diagnostics?.stuck_threshold_seconds ?? 600;
  const stale = useMemo(() => {
    if (!run) return false;
    if (!["queued", "running"].includes(run.status)) return false;
    const updatedAt = new Date(run.updated_at).getTime();
    if (Number.isNaN(updatedAt)) return false;
    return lastTickMs - updatedAt > staleSeconds * 1000;
  }, [lastTickMs, run, staleSeconds]);

  async function createRetryRun() {
    if (!run) return;
    setRetrying(true);
    const result = await ControlPlaneClient.createFactoryRunRecord({ planId: run.plan_id });
    setRetrying(false);
    if (result.state === "failed") {
      setError(result.error ?? "Retry run creation failed");
      return;
    }
    window.location.href = `/factory/run?runId=${result.data.id}&state=${result.state}`;
  }

  const liveLabel = backendMode === "live" ? "Live provider mode" : "Mock/stub provider mode";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-white">Factory Run</h1>
        <div className="flex items-center gap-2">
          <FactoryStateBadge state={state} />
          <span className="rounded-full border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-1 text-xs text-paradox-gray-300">
            {liveLabel}
          </span>
        </div>
      </div>

      <FactoryDisclosureBanner />

      {error ? <p className="text-sm text-rose-300">Live sync issue: {error}</p> : null}

      {!runId ? (
        <Card className="p-6 text-paradox-gray-300">
          Missing run ID. Start from intake and launch a run first.
        </Card>
      ) : null}

      {runId > 0 && !run ? (
        <Card className="p-6 text-paradox-gray-300">Loading run...</Card>
      ) : run ? (
        <>
          <Card className="space-y-3 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-paradox-gray-200">Run ID: {run.id}</p>
                <p className="text-sm text-paradox-gray-200">Run status: {run.status}</p>
                <p className="text-sm text-paradox-gray-200">Provider status: {run.sync.provider_status ?? "n/a"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void refresh()}>
                  Refresh now
                </Button>
                <Button variant="outline" onClick={() => setPollingPaused((prev) => !prev)}>
                  {pollingPaused ? "Resume polling" : "Pause polling"}
                </Button>
                <Button onClick={createRetryRun} disabled={retrying}>
                  {retrying ? "Starting retry..." : "Retry from this plan"}
                </Button>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-paradox-gray-800">
              <div
                className="h-full bg-paradox-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-paradox-gray-400">{progressMessage(run.status)}</p>
            <p className="text-xs text-paradox-gray-500">
              Updated {new Date(run.updated_at).toLocaleString()} | Poll interval {Math.round(pollDelay / 1000)}s
            </p>

            {stale ? (
              <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-100">
                Run appears stale (no update for more than {Math.floor(staleSeconds / 60)} minutes). You can retry from this plan.
              </div>
            ) : null}

            {providerError ? (
              <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
                Provider error: {providerError}
              </div>
            ) : null}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-3 p-6">
              <h2 className="text-lg font-semibold text-white">Status timeline</h2>
              {timeline.length === 0 ? (
                <p className="text-sm text-paradox-gray-300">No transition events yet.</p>
              ) : (
                <ul className="space-y-2">
                  {timeline.map((item) => (
                    <li key={item.id} className="rounded-xl border border-paradox-gray-800 p-3">
                      <p className="text-sm font-semibold text-white">
                        {item.from} -&gt; {item.to}
                      </p>
                      <p className="text-xs text-paradox-gray-400">
                        {new Date(item.at).toLocaleString()} | {item.actor}
                      </p>
                      <p className="text-xs text-paradox-gray-300">Reason: {item.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="space-y-3 p-6">
              <h2 className="text-lg font-semibold text-white">Diagnostics</h2>
              <p className="text-sm text-paradox-gray-300">Total runs: {diagnostics?.total_runs ?? "n/a"}</p>
              <p className="text-sm text-paradox-gray-300">Pending review: {diagnostics?.review_pending ?? "n/a"}</p>
              <p className="text-sm text-paradox-gray-300">Stuck runs: {diagnostics?.stuck_runs.length ?? 0}</p>
              <p className="text-sm text-paradox-gray-300">Failed runs: {diagnostics?.failed_runs.length ?? 0}</p>
              <pre className="max-h-40 overflow-auto rounded-xl bg-paradox-gray-900 p-3 text-xs text-paradox-gray-300">
                {JSON.stringify(diagnostics?.status_counts ?? {}, null, 2)}
              </pre>
            </Card>
          </div>

          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold text-white">Artifacts and provenance</h2>
            <p className="text-sm text-paradox-gray-300">Video URI: {run.sync.stitched_video_uri ?? "Not available yet"}</p>
            <p className="text-sm text-paradox-gray-300">Metadata URI: {run.sync.metadata_uri ?? "Not available yet"}</p>
            <p className="text-sm text-paradox-gray-300">Provider job ID: {run.sync.provider_job_id ?? "n/a"}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <pre className="max-h-56 overflow-auto rounded-xl bg-paradox-gray-900 p-3 text-xs text-paradox-gray-300">
                {JSON.stringify(run.sync.provider_provenance ?? {}, null, 2)}
              </pre>
              <pre className="max-h-56 overflow-auto rounded-xl bg-paradox-gray-900 p-3 text-xs text-paradox-gray-300">
                {JSON.stringify(run.sync.provider_manifest ?? {}, null, 2)}
              </pre>
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/factory/review?runId=${run.id}&state=${state}`}
              className="inline-flex items-center rounded-xl bg-paradox-accent px-4 py-2 text-sm font-semibold text-black"
            >
              Open review gate
            </Link>
            <Link
              href={`/factory/export?runId=${run.id}&state=${state}`}
              className="inline-flex items-center rounded-xl border border-paradox-gray-700 px-4 py-2 text-sm text-paradox-gray-200"
            >
              Open provenance/export
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function FactoryRunPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-paradox-gray-300">Loading run view...</div>}>
      <FactoryRunContent />
    </Suspense>
  );
}
