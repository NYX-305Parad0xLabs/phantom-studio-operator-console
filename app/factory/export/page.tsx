"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { FactoryDisclosureBanner } from "@/components/factory/FactoryDisclosureBanner";
import { FactoryStateBadge } from "@/components/factory/FactoryStateBadge";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryPlanRecord,
  type FactoryRunRecord,
  type FactoryUiStateLabel,
  type ProvenanceDetail,
  type PublishExportBundleDetail,
} from "@/lib/api/controlPlane";

function FactoryExportContent() {
  const params = useSearchParams();
  const runId = Number(params.get("runId") ?? "0");
  const [state, setState] = useState<FactoryUiStateLabel>(
    (params.get("state") as FactoryUiStateLabel) ?? "mocked",
  );
  const [run, setRun] = useState<FactoryRunRecord | null>(null);
  const [plan, setPlan] = useState<FactoryPlanRecord | null>(null);
  const [provenance, setProvenance] = useState<ProvenanceDetail | null>(null);
  const [bundle, setBundle] = useState<PublishExportBundleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    let mounted = true;

    const load = async () => {
      const runResult = await ControlPlaneClient.fetchFactoryRunRecord(runId);
      if (!mounted) return;
      setState(runResult.state);
      setRun(runResult.data);
      if (runResult.error) setError(runResult.error);

      let workflowRunId = 0;
      const planResult = await ControlPlaneClient.fetchFactoryPlanRecord(runResult.data.plan_id);
      if (!mounted) return;
      setPlan(planResult.data);
      workflowRunId = Number(planResult.data.workflow_run_id ?? 0);

      if (workflowRunId > 0) {
        const [prov, exp] = await Promise.all([
          ControlPlaneClient.fetchProvenance(workflowRunId),
          ControlPlaneClient.fetchExportBundle(workflowRunId),
        ]);
        if (!mounted) return;
        setProvenance(prov);
        setBundle(exp);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [runId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Factory Provenance & Export</h1>
        <FactoryStateBadge state={state} />
      </div>

      <FactoryDisclosureBanner />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card className="space-y-2 p-6">
        <h2 className="text-lg font-semibold text-white">Factory run artifacts</h2>
        <p className="text-sm text-paradox-gray-300">Run ID: {run?.id ?? "loading"}</p>
        <p className="text-sm text-paradox-gray-300">Plan ID: {run?.plan_id ?? "loading"}</p>
        <p className="text-sm text-paradox-gray-300">Workflow run ID: {plan?.workflow_run_id ?? "n/a"}</p>
        <p className="text-sm text-paradox-gray-300">Stitched URI: {run?.sync.stitched_video_uri ?? "n/a"}</p>
        <p className="text-sm text-paradox-gray-300">Metadata URI: {run?.sync.metadata_uri ?? "n/a"}</p>
      </Card>

      <Card className="space-y-2 p-6">
        <h2 className="text-lg font-semibold text-white">Provenance snapshot</h2>
        <p className="text-sm text-paradox-gray-300">
          Manifest checksum: {provenance?.manifest_checksum ?? "Not available"}
        </p>
        <pre className="max-h-64 overflow-auto rounded-xl bg-paradox-gray-900 p-3 text-xs text-paradox-gray-300">
          {JSON.stringify(run?.sync.provider_manifest ?? {}, null, 2)}
        </pre>
      </Card>

      <Card className="space-y-2 p-6">
        <h2 className="text-lg font-semibold text-white">Export bundle</h2>
        <p className="text-sm text-paradox-gray-300">
          Path: {bundle?.manifest_path ?? "Not exported yet"}
        </p>
        <p className="text-sm text-paradox-gray-300">Checksum: {bundle?.checksum ?? "n/a"}</p>
      </Card>
    </div>
  );
}

export default function FactoryExportPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-paradox-gray-300">Loading export view...</div>}>
      <FactoryExportContent />
    </Suspense>
  );
}
