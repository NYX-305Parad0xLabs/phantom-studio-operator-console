import { integrationMode } from "@/lib/config";

const storageAvailable = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const keys = {
  sourceId: "ps_provider_source_id",
  jobId: "ps_provider_job_id",
  transcriptId: "ps_provider_transcript_id",
  analysisId: "ps_provider_analysis_id",
};

function getNumber(key: string): number | null {
  if (!storageAvailable) {
    return null;
  }
  const value = window.localStorage.getItem(key);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function setNumber(key: string, value: number | null) {
  if (!storageAvailable) {
    return;
  }
  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, String(value));
}

export function setProviderSourceId(value: number) {
  setNumber(keys.sourceId, value);
}

export function getProviderSourceId(): number | null {
  return getNumber(keys.sourceId);
}

export function setProviderJobId(value: number) {
  setNumber(keys.jobId, value);
}

export function getProviderJobId(): number | null {
  return getNumber(keys.jobId);
}

export function setProviderTranscriptId(value: number) {
  setNumber(keys.transcriptId, value);
}

export function getProviderTranscriptId(): number | null {
  return getNumber(keys.transcriptId);
}

export function setProviderAnalysisId(value: number) {
  setNumber(keys.analysisId, value);
}

export function getProviderAnalysisId(): number | null {
  return getNumber(keys.analysisId);
}

export function usesLiveProviderFlow() {
  return integrationMode === "live";
}
