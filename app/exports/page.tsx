"use client";

import { PageTemplate } from "@/components/page/PageTemplate";
import { ExportReviewPanel } from "@/components/exports/ExportReviewPanel";

const sections = [
  {
    title: "Export bundles",
    detail:
      "Surface provider traces, prompt artifacts, manifest paths, and checksums.",
  },
  {
    title: "Provenance",
    detail: "Inspect audit events, review trails, and disclosure metadata.",
  },
  {
    title: "Control-plane handoff",
    detail: "Mark publish-ready payloads for later scheduling.",
  },
];

export default function ExportsPage() {
  return (
    <PageTemplate
      title="Exports"
      subtitle="Review normalized bundles"
      sections={sections}
    >
      <ExportReviewPanel />
    </PageTemplate>
  );
}
