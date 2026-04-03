import { PageTemplate } from "@/components/page/PageTemplate";

const sections = [
  {
    title: "Active programs",
    detail: "Group sources by franchise, label, or campaign.",
  },
  {
    title: "Credits",
    detail: "Track synthetic talent rights, licenses, and release notes.",
  },
  {
    title: "Metrics",
    detail: "Surface human review velocity and QA pass rates.",
  },
];

export default function ProjectsPage() {
  return (
    <PageTemplate
      title="Projects"
      subtitle="Organize creators and IP safely"
      sections={sections}
    />
  );
}
