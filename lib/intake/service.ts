import { ControlPlaneClient, IntakeSubmission } from "@/lib/api/controlPlane";
import { providerGatewayBaseUrl } from "@/lib/config";
import { ProviderGatewayClient } from "@/lib/api/providerGateway";
import type { IntakeFormValues } from "@/lib/intake/schema";
import {
  setProviderAnalysisId,
  setProviderJobId,
  setProviderSourceId,
  setProviderTranscriptId,
  usesLiveProviderFlow,
} from "@/lib/provider/state";

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

async function runProviderPipeline(values: IntakeFormValues, payload: IntakeSubmission) {
  if (!usesLiveProviderFlow()) {
    return null;
  }
  if (!providerGatewayReady()) {
    return null;
  }
  try {
    const source = await ProviderGatewayClient.createSource({
      sourceType: values.sourceType,
      mediaKind: "long_form_video",
      uri: payload.sourceReference,
      ownerAssertion: values.projectName || "Operator console",
      rightsConfirmed: true,
      syntheticCharacterName: values.syntheticEnabled ? values.syntheticVoice : undefined,
      syntheticDisclosureLabel: values.syntheticEnabled ? values.syntheticDisclosure : undefined,
    });
    setProviderSourceId(source.id);

    const job = await ProviderGatewayClient.createIngestJob(source.id);
    setProviderJobId(job.id);

    if (values.sourceType === "url") {
      await ProviderGatewayClient.ingestUrl({
        sourceId: source.id,
        rightsConfirmed: true,
        url: payload.sourceReference,
        targetFormat: "mp4",
      });
    } else {
      await ProviderGatewayClient.ingestUpload({
        sourceId: source.id,
        rightsConfirmed: true,
        filename: payload.sourceReference,
      });
    }

    await ProviderGatewayClient.transcribeJob(job.id);

    const transcript = await ProviderGatewayClient.transcribeSource(source.id, {
      rightsConfirmed: true,
      language: values.targetLanguages[0] ?? "en",
    });
    setProviderTranscriptId(transcript.transcript_id);

    const analysis = await ProviderGatewayClient.analyzeTranscript(transcript.transcript_id);
    setProviderAnalysisId(analysis.analysis_id);
    return { source, job, transcript, analysis };
  } catch (error) {
    console.warn("Provider workflow pipeline failed", error);
    return null;
  }
}

function providerGatewayReady() {
  return Boolean(providerGatewayBaseUrl);
}

export async function submitIntakeRun(values: IntakeFormValues) {
  const payload = buildSubmissionPayload(values);
  await ControlPlaneClient.createProject({ name: values.projectName });
  const run = await ControlPlaneClient.submitRun(payload);
  await runProviderPipeline(values, payload);
  return run;
}
