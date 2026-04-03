export const controlPlaneBaseUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ?? "";

export const providerGatewayBaseUrl =
  process.env.NEXT_PUBLIC_PROVIDER_GATEWAY_URL ?? "";

export const operatorAuthToken =
  process.env.NEXT_PUBLIC_OPERATOR_TOKEN ?? "operator-token";

export const providerAuthToken =
  process.env.NEXT_PUBLIC_PROVIDER_TOKEN ?? "provider-token";
