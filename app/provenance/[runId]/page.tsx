"use client";

import { PageTemplate } from "@/components/page/PageTemplate";
import { ExportBundlePanel } from "@/components/provenance/ExportBundlePanel";
import { ProvenancePanel } from "@/components/provenance/ProvenancePanel";

const sections = [
  {
    title: "Provider traces",
    detail: "Follow each model invocation back to the prompt + provider metadata.",
  },
  {
    title: "Assets",
    detail: "Confirm source references, generated derivatives, and checksums.",
  },
  {
    title: "Review + audit",
    detail: "Link audit events and decisions with the export manifest.",
  },
];

type ProvenancePageProps = {
  params: {
    runId: string;
  };
};

export default function RunProvenancePage({ params }: ProvenancePageProps) {
  return (
    <PageTemplate
      title="Provenance"
      subtitle={`Run ${params.runId} audit trail`}
      sections={sections}
    >
      <div className="space-y-6">
        <ProvenancePanel />
        <ExportBundlePanel />
      </div>
    </PageTemplate>
  );
}
