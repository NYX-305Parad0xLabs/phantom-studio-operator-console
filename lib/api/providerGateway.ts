import { providerGatewayBaseUrl, providerAuthToken } from "@/lib/config";

const mockProviderStatus = {
  assets: [
    { id: "clip-01", name: "Sample clip", type: "clip" },
    { id: "caption-01", name: "Caption plan", type: "caption" },
  ],
};

async function providerRequest<T>(path: string): Promise<T> {
  if (!providerGatewayBaseUrl) {
    return Promise.resolve(mockProviderStatus as unknown as T);
  }

  const res = await fetch(`${providerGatewayBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerAuthToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Provider gateway request failed");
  }

  return res.json();
}

export const ProviderGatewayClient = {
  async fetchAssets() {
    return providerRequest<{ assets: { id: string; name: string; type: string }[] }>(
      "/assets",
    );
  },
};
