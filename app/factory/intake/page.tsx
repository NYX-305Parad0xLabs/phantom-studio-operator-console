"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FactoryDisclosureBanner } from "@/components/factory/FactoryDisclosureBanner";
import { FactoryStateBadge } from "@/components/factory/FactoryStateBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryPlanCreateRequest,
  type FactoryUiStateLabel,
} from "@/lib/api/controlPlane";

const DEFAULT_FORM: FactoryPlanCreateRequest = {
  productName: "Parad0x Velvet Glow Foundation",
  productBrief: "Show a short makeup tutorial with clear before/after.",
  influencerLockId: "luna-v2",
  targetPlatform: "tiktok",
  rightsAsserted: true,
  disclosedSynthetic: true,
  disclosureText: "This is AI-generated synthetic content.",
  preferredBackend: "kling",
};

export default function FactoryIntakePage() {
  const router = useRouter();
  const [form, setForm] = useState<FactoryPlanCreateRequest>(DEFAULT_FORM);
  const [status, setStatus] = useState<FactoryUiStateLabel>("mocked");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitPlan() {
    setSubmitting(true);
    setError(null);
    const result = await ControlPlaneClient.createFactoryPlanRecord(form);
    setStatus(result.state);
    if (result.state === "failed") {
      setError(result.error ?? "Plan creation failed");
      setSubmitting(false);
      return;
    }
    router.push(`/factory/plan?planId=${result.data.id}&state=${result.state}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Factory Intake</h1>
        <FactoryStateBadge state={status} />
      </div>

      <FactoryDisclosureBanner />

      <Card className="space-y-4 p-6">
        <label className="block space-y-1">
          <span className="text-sm text-paradox-gray-200">Product name</span>
          <input
            value={form.productName}
            onChange={(event) => setForm((prev) => ({ ...prev, productName: event.target.value }))}
            className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-paradox-gray-200">Product brief</span>
          <textarea
            value={form.productBrief}
            onChange={(event) => setForm((prev) => ({ ...prev, productBrief: event.target.value }))}
            className="min-h-24 w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm text-paradox-gray-200">Character lock</span>
            <input
              value={form.influencerLockId}
              onChange={(event) => setForm((prev) => ({ ...prev, influencerLockId: event.target.value }))}
              className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-paradox-gray-200">Target platform</span>
            <select
              value={form.targetPlatform}
              onChange={(event) => setForm((prev) => ({ ...prev, targetPlatform: event.target.value }))}
              className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
            >
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
              <option value="youtube">YouTube Shorts</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm text-paradox-gray-200">Backend</span>
            <select
              value={form.preferredBackend}
              onChange={(event) => setForm((prev) => ({ ...prev, preferredBackend: event.target.value }))}
              className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-white"
            >
              <option value="kling">Kling</option>
              <option value="runway">Runway</option>
              <option value="cogvideox">CogVideoX</option>
              <option value="mock">Mock</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-paradox-gray-200">
          <input
            type="checkbox"
            checked={form.rightsAsserted}
            onChange={(event) => setForm((prev) => ({ ...prev, rightsAsserted: event.target.checked }))}
          />
          I confirm rights are asserted for this campaign.
        </label>

        <label className="flex items-center gap-2 text-sm text-paradox-gray-200">
          <input
            type="checkbox"
            checked={form.disclosedSynthetic}
            onChange={(event) => setForm((prev) => ({ ...prev, disclosedSynthetic: event.target.checked }))}
          />
          I confirm this content is disclosed as synthetic.
        </label>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button onClick={submitPlan} disabled={submitting || !form.rightsAsserted || !form.disclosedSynthetic}>
          Create plan
        </Button>
      </Card>
    </div>
  );
}
