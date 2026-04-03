export type ConnectionStatus = {
  id: string;
  name: string;
  baseUrl: string;
  live: boolean;
  ready: boolean;
  lastChecked: string;
  message?: string;
};

export const mockConnectionStatuses: ConnectionStatus[] = [
  {
    id: "control-plane",
    name: "Control plane",
    baseUrl: process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ?? "https://localhost:5000",
    live: true,
    ready: true,
    lastChecked: "2026-04-03T12:45:00Z",
  },
  {
    id: "provider-gateway",
    name: "Provider gateway",
    baseUrl: process.env.NEXT_PUBLIC_PROVIDER_GATEWAY_URL ?? "https://localhost:6000",
    live: true,
    ready: false,
    lastChecked: "2026-04-03T12:44:30Z",
    message: "Voice service warming up; still loading lip-sync models.",
  },
];

export type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
};

export const mockFeatureFlags: FeatureFlag[] = [
  {
    key: "preview-progressive",
    name: "Progressive preview caching",
    description: "Cache provider assets progressively for faster review renders.",
    enabled: true,
  },
  {
    key: "strict-publish-lock",
    name: "Strict publish lock",
    description: "Block scheduling until export manifest checksums are verified.",
    enabled: false,
  },
];
