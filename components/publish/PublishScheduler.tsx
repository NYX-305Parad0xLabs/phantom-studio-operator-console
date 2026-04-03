"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type PublishPreparePayload,
  type PublishSchedulePayload,
} from "@/lib/api/controlPlane";
import { defaultWorkflowRunId, isLiveIntegration } from "@/lib/config";
import { mockPublishTargets } from "@/lib/publish/mock";
import { usePublishJobData } from "@/lib/publish/usePublishJob";

type RunAsset = {
  kind?: string;
  uri?: string;
};

export function PublishScheduler() {
  const [target, setTarget] = useState(mockPublishTargets[0].slug);
  const [schedule, setSchedule] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { isMock, jobId } = usePublishJobData();
  const queryClient = useQueryClient();

  const runId = defaultWorkflowRunId;
  const runQuery = useQuery({
    queryKey: ["run", runId],
    queryFn: () => ControlPlaneClient.fetchRunDetail(runId),
    enabled: isLiveIntegration && runId > 0,
    staleTime: 30_000,
  });

  const assetUri = (runQuery.data?.assets as RunAsset[] | undefined)
    ?.find((asset) => asset.kind === "lipsync")
    ?.uri;

  const usesLiveWrites = isLiveIntegration && !isMock;

  const prepareMutation = useMutation({
    mutationFn: (payload: PublishPreparePayload) =>
      ControlPlaneClient.preparePublish(runId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["publish-job"] });
      queryClient.invalidateQueries({ queryKey: ["publish-job", result.id] });
      setStatusMessage("Live publish job prepared.");
    },
    onError: () => {
      setStatusMessage("Control plane unavailable for live preparation.");
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (payload: PublishSchedulePayload) =>
      ControlPlaneClient.schedulePublishJob(jobId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["publish-job", result.id] });
      setStatusMessage("Publish scheduled on control plane.");
    },
    onError: () => {
      setStatusMessage("Control plane scheduling failed.");
    },
  });

  const executeMutation = useMutation({
    mutationFn: () => ControlPlaneClient.executePublishJob(jobId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["publish-job", result.id] });
      setStatusMessage("Publish execution triggered.");
    },
    onError: () => {
      setStatusMessage("Publish execution failed.");
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    if (!isLiveIntegration) {
      setStatusMessage("Live writes are disabled; scheduling remains mocked.");
      return;
    }
    if (runId <= 0 || !assetUri) {
      setStatusMessage(
        "Live run or lipsync asset missing; configure NEXT_PUBLIC_DEFAULT_WORKFLOW_RUN_ID.",
      );
      return;
    }

    const metadata: Record<string, string> = {};
    if (title.trim()) {
      metadata.titleOverride = title.trim();
    }
    if (caption.trim()) {
      metadata.captionOverride = caption.trim();
    }

    try {
      await prepareMutation.mutateAsync({
        assetUri,
        platformSlug: target,
        metadata,
      });

      if (schedule) {
        await scheduleMutation.mutateAsync({
          scheduledFor: new Date(schedule).toISOString(),
          note: caption || title,
        });
      }
    } catch {
      // Mutations already set messages.
    }
  };

  const handleExecute = async () => {
    if (!usesLiveWrites || jobId <= 0) {
      setStatusMessage("Live execute unavailable until a job is prepared.");
      return;
    }
    await executeMutation.mutateAsync();
  };

  const isSubmitting = prepareMutation.isPending || scheduleMutation.isPending;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
            Publish scheduling
          </p>
          <p className="text-lg font-semibold text-white">Prepare outbound job</p>
        </div>
        <Badge
          variant={usesLiveWrites ? "success" : "muted"}
          className="text-[10px] uppercase tracking-[0.3em]"
        >
          {usesLiveWrites ? "Live writes" : "Mock writes"}
        </Badge>
      </div>

      <p className="text-xs text-paradox-gray-400">
        {usesLiveWrites
          ? "Live control-plane writes are enabled; this will create a PublishJob."
          : "Mock writes only: set NEXT_PUBLIC_INTEGRATION_MODE=live to enable real scheduling."}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="platform-select">Platform target</label>
          <select
            id="platform-select"
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            {mockPublishTargets.map((option) => (
              <option key={option.id} value={option.slug}>
                {option.platform} · {option.account} ({option.label})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="schedule-input">Schedule time (UTC)</label>
          <input
            id="schedule-input"
            type="datetime-local"
            value={schedule}
            onChange={(event) => setSchedule(event.target.value)}
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="title-override">Title override</label>
          <input
            id="title-override"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional title"
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="caption-override">Caption override</label>
          <textarea
            id="caption-override"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Optional caption"
            rows={2}
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
          />
        </div>
        {runId <= 0 && (
          <p className="text-xs text-paradox-amber">
            Configure NEXT_PUBLIC_DEFAULT_WORKFLOW_RUN_ID to target a live run.
          </p>
        )}
        {!assetUri && isLiveIntegration && (
          <p className="text-xs text-paradox-amber">
            Unable to locate lipsync asset in run {runId}; ensure the workflow publishes a lipsync asset.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {usesLiveWrites ? "Prepare & schedule" : "Simulate scheduling"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExecute}
            disabled={!usesLiveWrites || executeMutation.isPending}
          >
            {executeMutation.isPending ? "Executing…" : "Execute now"}
          </Button>
          <p className="text-xs text-paradox-gray-400">
            {statusMessage ?? "Publishing waits for an approved review decision before scheduling."}
          </p>
        </div>
      </form>
    </Card>
  );
}
