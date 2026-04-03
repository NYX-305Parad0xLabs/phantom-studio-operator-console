export const decisionTypes = [
  { id: "approve", label: "Approve" },
  { id: "reject", label: "Reject" },
  { id: "regenerate", label: "Request regenerate" },
] as const;

export type DecisionType = (typeof decisionTypes)[number]["id"];

export type DecisionPayload = {
  decisionType: DecisionType;
  notes: string;
  artifactScope: string;
};

export const mockArtifactScopes = [
  "captions",
  "voice",
  "lipsync",
  "render/export",
  "publish-ready bundle",
];
