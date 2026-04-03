import { PageTemplate } from "@/components/page/PageTemplate";
import { PlaceholderContent } from "@/components/page/PlaceholderContent";

const sections = [
  {
    title: "Submit media",
    detail: "Drop a URL or upload reference before handing to the control plane.",
  },
  {
    title: "Creator identity",
    detail: "Enforce original/licensed flags and synthetic disclosures.",
  },
  {
    title: "Workflow intent",
    detail: "Choose 'one killer short' or 'series', set languages and styling.",
  },
];

export default function IntakePage() {
  return (
    <div className="space-y-6">
      <PageTemplate
        title="Intake"
        subtitle="Declare the source and intent"
        sections={sections}
      >
        <PlaceholderContent highlight="Ready to submit">
          <p>Gain confidence before handing the media to the control-plane job queue.</p>
        </PlaceholderContent>
      </PageTemplate>
    </div>
  );
}
