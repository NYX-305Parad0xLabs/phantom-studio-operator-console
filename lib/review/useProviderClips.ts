import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProviderGatewayClient, type ClipCandidateRead, type ViralAnalysisRead } from "@/lib/api/providerGateway";
import {
  defaultProviderAnalysisId,
  defaultProviderTranscriptId,
  integrationMode,
} from "@/lib/config";
import {
  getProviderAnalysisId,
  getProviderTranscriptId,
  usesLiveProviderFlow,
} from "@/lib/provider/state";
import type { ClipCandidate } from "@/lib/review/clip";
import { mockClipCandidates } from "@/lib/review/clip";

function computeExcerpt(
  transcriptSegments: { start_seconds: number; end_seconds: number; text: string }[] | undefined,
  clip: ClipCandidateRead,
) {
  if (!transcriptSegments?.length) {
    return "Transcript unavailable";
  }
  const matches = transcriptSegments.filter(
    (segment) =>
      segment.start_seconds >= clip.start_seconds && segment.end_seconds <= clip.end_seconds,
  );
  if (!matches.length) {
    const fallback = transcriptSegments.find(
      (segment) =>
        segment.start_seconds <= clip.start_seconds && segment.end_seconds >= clip.end_seconds,
    );
    return fallback?.text ?? transcriptSegments[0].text;
  }
  return matches.map((segment) => segment.text).join(" ");
}

function mapClips(
  analysis: ViralAnalysisRead,
  transcript: { segments: { start_seconds: number; end_seconds: number; text: string }[] } | null,
): ClipCandidate[] {
  return analysis.clips.map((clip) => ({
    id: `${analysis.analysis_id}-${clip.start_seconds}-${clip.end_seconds}`,
    startSeconds: clip.start_seconds,
    endSeconds: clip.end_seconds,
    durationSeconds: clip.duration_seconds,
    score: clip.score,
    rationale: clip.rationale,
    transcriptExcerpt: transcript ? computeExcerpt(transcript.segments, clip) : "Transcript unavailable",
    bestClip: clip.best_clip,
    platformHint: "provider clip",
    styleNotes: analysis.decision_text,
  }));
}

export function useProviderClips() {
  const envAnalysisId = defaultProviderAnalysisId;
  const storedAnalysisId = getProviderAnalysisId() ?? 0;
  const analysisId = storedAnalysisId || envAnalysisId;

  const envTranscriptId = defaultProviderTranscriptId;
  const storedTranscriptId = getProviderTranscriptId() ?? 0;
  const transcriptId = storedTranscriptId || envTranscriptId;

  const usesLive = usesLiveProviderFlow() && integrationMode === "live";

  const analysisQuery = useQuery({
    queryKey: ["provider-analysis", analysisId],
    queryFn: () => ProviderGatewayClient.fetchAnalysis(analysisId),
    enabled: usesLive && analysisId > 0,
  });

  const transcriptQuery = useQuery({
    queryKey: ["provider-transcript", transcriptId],
    queryFn: () => ProviderGatewayClient.fetchTranscript(transcriptId),
    enabled: usesLive && transcriptId > 0,
  });

  const candidates = useMemo<ClipCandidate[]>(() => {
    if (usesLive && analysisQuery.data) {
      return mapClips(analysisQuery.data, transcriptQuery.data ?? null);
    }
    return mockClipCandidates;
  }, [analysisQuery.data, transcriptQuery.data, usesLive]);

  return {
    candidates,
    isLive: usesLive && !!analysisQuery.data,
    isMock: !(usesLive && !!analysisQuery.data),
    isLoading: analysisQuery.isLoading || transcriptQuery.isLoading,
  };
}
