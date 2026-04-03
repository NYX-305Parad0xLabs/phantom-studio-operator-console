import { PageTemplate } from "@/components/page/PageTemplate";

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
    />
  );
}
