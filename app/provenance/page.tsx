import { PageTemplate } from "@/components/page/PageTemplate";
import { ProvenancePanel } from "@/components/provenance/ProvenancePanel";

const sections = [
  {
    title: "Audit trails",
    detail: "Review traceability from provider gateway and control plane.",
  },
  {
    title: "Checksums",
    detail: "Confirm export manifest hashes and disclosure attachments.",
  },
  {
    title: "Operator notes",
    detail: "Log findings before scheduling publish jobs.",
  },
];

export default function ProvenancePage() {
  return (
    <PageTemplate
      title="Provenance"
      subtitle="Inspect traceability"
      sections={sections}
    >
      <div className="space-y-6">
        <ProvenancePanel />
      </div>
    </PageTemplate>
  );
}
