"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTemplate } from "@/components/page/PageTemplate";
import { operatorAuthToken, providerAuthToken } from "@/lib/config";
import { mockConnectionStatuses, mockFeatureFlags } from "@/lib/settings/status";

type ConnectionPanelProps = {
  status: (typeof mockConnectionStatuses)[number];
};

function ConnectionPanel({ status }: ConnectionPanelProps) {
  const subtitle = `${status.baseUrl} · last checked ${new Date(
    status.lastChecked,
  ).toLocaleString()}`;

  return (
    <Card className="space-y-3 border border-paradox-gray-700/80">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          {status.name}
        </p>
        <Badge variant={status.live ? "success" : "muted"} className="text-[10px]">
          {status.live ? "Live" : "Down"}
        </Badge>
      </div>
      <p className="text-sm text-paradox-gray-200">{subtitle}</p>
      <div className="flex gap-2 text-xs text-paradox-gray-400">
        <Badge variant={status.ready ? "accent" : "muted"} className="text-[10px]">
          {status.ready ? "Ready" : "Degraded"}
        </Badge>
        {!status.ready && <span>{status.message}</span>}
      </div>
    </Card>
  );
}

function AuthStatusPanel() {
  const masks = {
    operator: operatorAuthToken ? "configured" : "missing",
    provider: providerAuthToken ? "configured" : "missing",
  };

  return (
    <Card className="space-y-3 border border-paradox-gray-700/80">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Auth tokens</p>
        <p className="text-lg font-semibold text-white">Operator visibility</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3">
          <p className="text-sm text-paradox-gray-400">Operator token</p>
          <Badge variant={operatorAuthToken ? "success" : "muted"} className="text-[10px]">
            {masks.operator}
          </Badge>
        </div>
        <div className="space-y-1 rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3">
          <p className="text-sm text-paradox-gray-400">Provider token</p>
          <Badge variant={providerAuthToken ? "success" : "muted"} className="text-[10px]">
            {masks.provider}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-paradox-gray-400">
        Tokens are never shown. Use environment variables to supply new values.
      </p>
    </Card>
  );
}

function FeatureFlagPanel() {
  return (
    <Card className="space-y-3 border border-paradox-gray-700/80">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Feature flags</p>
        <p className="text-lg font-semibold text-white">Operator toggles</p>
      </div>
      <div className="space-y-3">
        {mockFeatureFlags.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900/60 p-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{flag.name}</p>
              <p className="text-xs text-paradox-gray-400">{flag.description}</p>
            </div>
            <Badge variant={flag.enabled ? "success" : "muted"} className="text-[10px]">
              {flag.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

type HealthDashboardProps = {
  statuses: typeof mockConnectionStatuses;
};

function HealthDashboard({ statuses }: HealthDashboardProps) {
  return (
    <Card className="space-y-4 border border-paradox-gray-700/80">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Health dashboard</p>
        <Badge variant="muted" className="text-[10px]">
          {new Date().toLocaleTimeString()}
        </Badge>
      </div>
      <div className="space-y-3">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/50 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{status.name}</p>
              <Badge variant={status.live ? "success" : "muted"} className="text-[10px]">
                {status.live ? "Live" : "Offline"}
              </Badge>
            </div>
            <p className="text-xs text-paradox-gray-400">
              Ready: {status.ready ? "yes" : "no"} · Last check:{" "}
              {new Date(status.lastChecked).toLocaleTimeString()}
            </p>
            {!status.ready && <p className="text-xs text-paradox-amber">{status.message}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}

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
      subtitle="Operator console visibility"
      sections={sections}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {mockConnectionStatuses.map((status) => (
            <ConnectionPanel key={status.id} status={status} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <AuthStatusPanel />
          <FeatureFlagPanel />
        </div>
        <HealthDashboard statuses={mockConnectionStatuses} />
      </div>
    </PageTemplate>
  );
}
