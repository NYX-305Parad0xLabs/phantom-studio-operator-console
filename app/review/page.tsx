import { PageTemplate } from "@/components/page/PageTemplate";

const sections = [
  {
    title: "Captions & translations",
    detail: "Spot-check sendshort-like captions plus localized cues.",
  },
  {
    title: "Voice & lip-sync",
    detail: "Listen to synthetic audio, check disclosure metadata.",
  },
  {
    title: "Human gate",
    detail: "Approve, reject, or request regenerate before export.",
  },
];

export default function ReviewPage() {
  return (
    <PageTemplate
      title="Review"
      subtitle="Approve synthetic assets"
      sections={sections}
    />
  );
}
