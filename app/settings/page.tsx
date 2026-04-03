"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTemplate } from "@/components/page/PageTemplate";
import { controlPlaneBaseUrl, integrationMode, operatorAuthToken, providerAuthToken, providerGatewayBaseUrl } from "@/lib/config";
import { fetchControlPlaneHealth, fetchProviderGatewayHealth, type BackendHealthStatus } from "@/lib/api/health";
import {
  ConnectionStatus,
  mockConnectionStatuses,
  mockFeatureFlags,
} from "@/lib/settings/status";

type ConnectionPanelProps = {
  status: ConnectionStatus;
};

function buildConnectionStatuses(statuses: BackendHealthStatus[]): ConnectionStatus[] {
  const accumulator: Record<string, Partial<ConnectionStatus>> = {
    "control-plane": {
      id: "control-plane",
      name: "Control plane",
      baseUrl: controlPlaneBaseUrl || "https://localhost:5000",
    },
    "provider-gateway": {
      id: "provider-gateway",
      name: "Provider gateway",
      baseUrl: providerGatewayBaseUrl || "https://localhost:6000",
    },
  };
  const now = new Date().toISOString();
  Object.values(accumulator).forEach((entry) => {
    entry.live = false;
    entry.ready = false;
    entry.lastChecked = now;
  });
  statuses.forEach((status) => {
    const entry = accumulator[status.service];
    if (!entry) return;
    if (status.kind === "live") {
      entry.live = status.status.toLowerCase() === "live";
    }
    if (status.kind === "ready") {
      entry.ready = status.status.toLowerCase() === "ready";
    }
    entry.lastChecked = status.timestamp;
    if (status.detail) {
      entry.message = status.detail;
    }
  });
  return Object.values(accumulator) as ConnectionStatus[];
}

function ConnectionPanel({ status }: ConnectionPanelProps) {
  const subtitle = `${status.baseUrl} - last checked ${new Date(status.lastChecked).toLocaleString()}`;

  return (
    <Card className="space-y-3 border border-paradox-gray-700/80">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          {status.name}
        </p>
        <Badge variant={status.live ? "success" : "muted"} className="text-[10px]">
          {status.live ? "Live" : "Offline"}
        </Badge>
      </div>
      <p className="text-sm text-paradox-gray-200">{subtitle}</p>
      <div className="flex gap-2 text-xs text-paradox-gray-400">
        <Badge variant={status.ready ? "accent" : "muted"} className="text-[10px]">
          {status.ready ? "Ready" : "Degraded"}
        </Badge>
        {!status.ready && status.message && <span>{status.message}</span>}
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
  statuses: ConnectionStatus[];
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
              Ready: {status.ready ? "yes" : "no"} - Last check: {new Date(status.lastChecked).toLocaleTimeString()}
            </p>
            {!status.ready && status.message && (
              <p className="text-xs text-paradox-amber">{status.message}</p>
            )}
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
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatus[]>(mockConnectionStatuses);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (integrationMode !== "live") {
        if (!active) return;
        setConnectionStatuses(mockConnectionStatuses);
        setHealthLoading(false);
        return;
      }
      Promise.resolve().then(() => {
        if (!active) return;
        setHealthLoading(true);
        setHealthError(null);
      });
      try {
        const [control, provider] = await Promise.all([
          fetchControlPlaneHealth(),
          fetchProviderGatewayHealth(),
        ]);
        if (!active) return;
        setConnectionStatuses(buildConnectionStatuses([...control, ...provider]));
      } catch (error) {
        if (!active) return;
        setHealthError(error instanceof Error ? error.message : String(error));
        setConnectionStatuses(mockConnectionStatuses);
      } finally {
        if (!active) return;
        setHealthLoading(false);
      }
    };
    refresh();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageTemplate
      title="Settings"
      subtitle="Operator console visibility"
      sections={sections}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={integrationMode === "live" ? "success" : "muted"} className="text-[10px] uppercase tracking-[0.3em]">
            Integration mode: {integrationMode}
          </Badge>
          {healthLoading && <p className="text-xs text-paradox-emerald">Polling live health…</p>}
          {healthError && (
            <p className="text-xs text-paradox-amber">Live health unavailable: {healthError}</p>
          )}
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {connectionStatuses.map((status) => (
              <ConnectionPanel key={status.id} status={status} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <AuthStatusPanel />
            <FeatureFlagPanel />
          </div>
          <HealthDashboard statuses={connectionStatuses} />
        </div>
      </div>
    </PageTemplate>
  );
}
