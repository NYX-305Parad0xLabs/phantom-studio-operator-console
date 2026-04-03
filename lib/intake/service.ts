import { ControlPlaneClient, IntakeSubmission } from "@/lib/api/controlPlane";
import { ProviderGatewayClient } from "@/lib/api/providerGateway";
import type { IntakeFormValues } from "@/lib/intake/schema";

export function buildSubmissionPayload(values: IntakeFormValues): IntakeSubmission {
  const sourceReference =
    values.sourceType === "url" ? values.sourceUrl! : values.uploadReference!;

  return {
    sourceType: values.sourceType,
    sourceReference,
    projectId: values.projectName,
    clipMode: values.clipMode,
    targetPlatforms: values.targetPlatforms,
    targetLanguages: values.targetLanguages,
    styleNotes: values.styleNotes,
    syntheticDisclosure: values.syntheticEnabled ? values.syntheticDisclosure : undefined,
  };
}

export async function submitIntakeRun(values: IntakeFormValues) {
  const payload = buildSubmissionPayload(values);
  await ControlPlaneClient.createProject({ name: values.projectName });
  const run = await ControlPlaneClient.submitRun(payload);
  await ProviderGatewayClient.triggerIngest({
    sourceType: payload.sourceType,
    sourceReference: payload.sourceReference,
    clipMode: payload.clipMode,
    languages: payload.targetLanguages,
    platforms: payload.targetPlatforms,
  });
  return run;
}
