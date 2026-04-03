"use client";

import { PageTemplate } from "@/components/page/PageTemplate";
import { PublishScheduler } from "@/components/publish/PublishScheduler";
import { PublishStatusPanel } from "@/components/publish/PublishStatusPanel";
import { PublishHistory } from "@/components/publish/PublishHistory";

const sections = [
  {
    title: "Scheduling",
    detail: "Queue operator-approved exports through the control plane.",
  },
  {
    title: "Targets",
    detail: "Map TikTok, Instagram, or X posts to publish readiness.",
  },
  {
    title: "Guardrails",
    detail:
      "Block execution until reviews, disclosures, and manifests are aligned.",
  },
];

export default function PublishPage() {
  return (
    <PageTemplate
      title="Publish"
      subtitle="Schedule outbound jobs"
      sections={sections}
    >
      <div className="space-y-6">
        <PublishScheduler />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PublishStatusPanel />
          <PublishHistory />
        </div>
      </div>
    </PageTemplate>
  );
}
