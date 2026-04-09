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
  type FactoryPlanRecord,
  type FactoryUiStateLabel,
} from "@/lib/api/controlPlane";

export default function FactoryPlanPage() {
  const params = useSearchParams();
  const planId = Number(params.get("planId") ?? "0");
  const [plan, setPlan] = useState<FactoryPlanRecord | null>(null);
  const [status, setStatus] = useState<FactoryUiStateLabel>(
    (params.get("state") as FactoryUiStateLabel) ?? "mocked",
  );
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (!planId) return;
    let mounted = true;
    ControlPlaneClient.fetchFactoryPlanRecord(planId).then((result) => {
      if (!mounted) return;
      setStatus(result.state);
      setPlan(result.data);
      setError(result.error ?? null);
    });
    return () => {
      mounted = false;
    };
  }, [planId]);

  async function launchRun() {
    if (!plan) return;
    setLaunching(true);
    const result = await ControlPlaneClient.createFactoryRunRecord({ planId: plan.id });
    setLaunching(false);
    setStatus(result.state);
    if (result.state === "failed") {
      setError(result.error ?? "Failed to launch run");
      return;
    }
    window.location.href = `/factory/run?runId=${result.data.id}&state=${result.state}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Factory Plan</h1>
        <FactoryStateBadge state={status} />
      </div>
      <FactoryDisclosureBanner />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {!plan ? (
        <Card className="p-6 text-paradox-gray-300">Loading plan...</Card>
      ) : (
        <>
          <Card className="space-y-2 p-6">
            <p className="text-sm text-paradox-gray-300">Product: {plan.product_input.product_name}</p>
            <p className="text-sm text-paradox-gray-300">Platform: {plan.target_platform}</p>
            <p className="text-sm text-paradox-gray-300">Lock: {plan.influencer_lock_id}</p>
            <p className="text-sm text-paradox-gray-300">
              Disclosure: {plan.disclosure_text}
            </p>
          </Card>

          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-semibold text-white">Scene breakdown</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {plan.scene_breakdown.map((scene) => (
                <div key={scene.shot_id} className="rounded-xl border border-paradox-gray-800 p-4">
                  <p className="text-sm font-semibold text-white">{scene.shot_id}</p>
                  <p className="text-xs text-paradox-gray-400">{scene.duration_seconds}s</p>
                  <p className="text-sm text-paradox-gray-300">{scene.prompt}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={launchRun} disabled={launching}>Launch run</Button>
            <Link
              href="/factory/intake"
              className="inline-flex items-center rounded-xl border border-paradox-gray-700 px-4 py-2 text-sm text-paradox-gray-200"
            >
              Back to intake
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
