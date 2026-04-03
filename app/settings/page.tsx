import { PageTemplate } from "@/components/page/PageTemplate";

const sections = [
  {
    title: "Control plane",
    detail: "Configure base URL, auth tokens, and role enforcement.",
  },
  {
    title: "Provider gateway",
    detail: "Point to voice, lip-sync, and render endpoints securely.",
  },
  {
    title: "Diagnostics",
    detail: "Monitor health, logs, and API round-trips.",
  },
];

export default function SettingsPage() {
  return (
    <PageTemplate
      title="Settings"
      subtitle="Configure the console"
      sections={sections}
    />
  );
}
