import { controlPlaneBaseUrl, integrationMode, operatorAuthToken, providerAuthToken, providerGatewayBaseUrl } from "@/lib/config";

export type HealthKind = "live" | "ready";

export type BackendHealthStatus = {
  service: "control-plane" | "provider-gateway";
  kind: HealthKind;
  status: string;
  detail?: string;
  timestamp: string;
};

async function fetchHealthEndpoint(
  baseUrl: string,
  path: string,
  service: BackendHealthStatus["service"],
  kind: HealthKind,
): Promise<BackendHealthStatus> {
  if (!baseUrl) {
    throw new Error(`${service} base URL is not configured`);
  }
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${service === "control-plane" ? operatorAuthToken : providerAuthToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(`${service} health check failed`);
  }
  const body = await res.json();
  return {
    service,
    kind,
    status: body.status,
    detail: body.environment,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchControlPlaneHealth(): Promise<BackendHealthStatus[]> {
  if (integrationMode !== "live") {
    return [];
  }
  return Promise.all([
    fetchHealthEndpoint(controlPlaneBaseUrl, "/health/live", "control-plane", "live"),
    fetchHealthEndpoint(controlPlaneBaseUrl, "/health/ready", "control-plane", "ready"),
  ]);
}

export async function fetchProviderGatewayHealth(): Promise<BackendHealthStatus[]> {
  if (integrationMode !== "live") {
    return [];
  }
  return Promise.all([
    fetchHealthEndpoint(providerGatewayBaseUrl, "/health/live", "provider-gateway", "live"),
    fetchHealthEndpoint(providerGatewayBaseUrl, "/health/ready", "provider-gateway", "ready"),
  ]);
}
