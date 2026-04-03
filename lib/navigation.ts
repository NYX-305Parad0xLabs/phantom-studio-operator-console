export type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: string;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    description: "Live job queue, health, and quick actions.",
    icon: "dashboard",
  },
  {
    label: "Intake",
    href: "/intake",
    description: "Declare original or licensed media ahead of processing.",
    icon: "upload",
  },
  {
    label: "Projects",
    href: "/projects",
    description: "Group media sources by creator, studio, or brand.",
    icon: "layers",
  },
  {
    label: "Runs",
    href: "/runs",
    description: "Track workflow runs and their statuses.",
    icon: "pulse",
  },
  {
    label: "Review",
    href: "/review",
    description: "Approve/reject assets and human QA decisions.",
    icon: "check",
  },
  {
    label: "Exports",
    href: "/exports",
    description: "Inspect normalized export bundles and manifests.",
    icon: "file",
  },
  {
    label: "Publish",
    href: "/publish",
    description: "Schedule approved exports through the control plane.",
    icon: "send",
  },
  {
    label: "Provenance",
    href: "/provenance",
    description: "Review audit trails and policy footprints.",
    icon: "shield",
  },
  {
    label: "Settings",
    href: "/settings",
    description: "Configure control-plane and provider endpoints.",
    icon: "cog",
  },
];
