import { PageTemplate } from "@/components/page/PageTemplate";

const sections = [
  {
    title: "Workflow runs",
    detail: "Trace ingest → transcription → analysis → clip selection.",
  },
  {
    title: "Status badges",
    detail: "Evaluate machine QA, human review, and publish readiness.",
  },
  {
    title: "Drill-downs",
    detail: "Open run timelines to inspect assets and audit trails.",
  },
];

export default function RunsPage() {
  return (
    <PageTemplate
      title="Runs"
      subtitle="Track every workflow run"
      sections={sections}
    />
  );
}
