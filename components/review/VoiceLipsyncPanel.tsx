"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProviderGatewayClient } from "@/lib/api/providerGateway";
import {
  defaultProviderLipsyncId,
  defaultProviderVoiceId,
  integrationMode,
} from "@/lib/config";
import {
  getProviderLipsyncId,
  getProviderVoiceId,
  usesLiveProviderFlow,
} from "@/lib/provider/state";
import {
  mockLipsyncArtifact,
  mockVoiceArtifact,
} from "@/lib/provider/mockVoice";

export function VoiceLipsyncPanel() {
  const storedVoiceId = getProviderVoiceId();
  const storedLipsyncId = getProviderLipsyncId();

  const voiceId = storedVoiceId ?? defaultProviderVoiceId;
  const lipsyncId = storedLipsyncId ?? defaultProviderLipsyncId;

  const isVoiceLiveEnabled =
    usesLiveProviderFlow() && integrationMode === "live" && voiceId > 0;
  const isLipsyncLiveEnabled =
    usesLiveProviderFlow() && integrationMode === "live" && lipsyncId > 0;

  const voiceQuery = useQuery({
    queryKey: ["provider-voice", voiceId],
    queryFn: () => ProviderGatewayClient.fetchVoiceArtifact(voiceId),
    enabled: isVoiceLiveEnabled,
    staleTime: 30_000,
  });

  const lipsyncQuery = useQuery({
    queryKey: ["provider-lipsync", lipsyncId],
    queryFn: () => ProviderGatewayClient.fetchLipSyncArtifact(lipsyncId),
    enabled: isLipsyncLiveEnabled,
    staleTime: 30_000,
  });

  const voiceData = voiceQuery.data ?? mockVoiceArtifact;
  const lipsyncData = lipsyncQuery.data ?? mockLipsyncArtifact;

  const voiceLive = Boolean(voiceQuery.data && isVoiceLiveEnabled);
  const lipsyncLive = Boolean(lipsyncQuery.data && isLipsyncLiveEnabled);

  const voiceBadgeLabel = voiceLive ? "Voice live" : "Mock voice";
  const lipsyncBadgeLabel = lipsyncLive ? "Lip-sync live" : "Mock lip-sync";

  const voiceMetadata = useMemo(
    () => [
      ["Duration", `${voiceData.duration_seconds.toFixed(1)}s`],
      ["Sample rate", `${voiceData.sample_rate}Hz`],
      ["Provider", voiceData.provider_name],
      ["Model", voiceData.provider_model],
    ],
    [voiceData],
  );

  const toneHint = useMemo(() => {
    const details = voiceData.details as { tone?: string } | null;
    return details?.tone ?? "Tonal mix";
  }, [voiceData.details]);

  const lipsyncMetadata = useMemo(
    () => [
      ["Duration", `${lipsyncData.duration_seconds.toFixed(1)}s`],
      ["Provider", lipsyncData.provider_name],
      ["Model", lipsyncData.provider_model],
      ["Disclosure", lipsyncData.disclosure.disclosure_label],
    ],
    [lipsyncData],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
            Voice & lip-sync
          </p>
          <p className="text-xl font-semibold text-white">
            Review provenance, consent, and media previews
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={voiceLive ? "success" : "muted"} className="text-[10px]">
            {voiceBadgeLabel}
          </Badge>
          <Badge variant={lipsyncLive ? "success" : "muted"} className="text-[10px]">
            {lipsyncBadgeLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Voice preview</p>
            <Badge variant="outline" className="text-[10px] text-paradox-gray-400">
              {toneHint}
            </Badge>
          </div>
          <audio
            className="w-full rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40"
            controls
            src={voiceData.audio_uri}
          >
            Your browser does not support audio playback.
          </audio>
          <div className="space-y-1 text-[11px] text-paradox-gray-400">
            {voiceMetadata.map(([label, value]) => (
              <p key={label}>
                <span className="text-paradox-gray-500">{label}:</span> {value}
              </p>
            ))}
          </div>
          <div className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40 p-3 text-[11px] text-paradox-gray-300">
            <p className="text-[10px] uppercase tracking-[0.3em] text-paradox-gray-500">
              Provenance trace
            </p>
            <pre className="max-h-32 overflow-auto text-[10px]">
              {JSON.stringify(voiceData.provenance, null, 2)}
            </pre>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Lip-sync preview</p>
            <Badge variant="outline" className="text-[10px] text-paradox-emerald">
              Consent {lipsyncData.disclosure.consent_confirmed ? "confirmed" : "required"}
            </Badge>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-paradox-gray-700/80 bg-black/40">
            <video
              className="w-full"
              playsInline
              controls
              muted
              src={lipsyncData.video_uri}
            >
              Your browser cannot play this video.
            </video>
          </div>
          <div className="space-y-1 text-[11px] text-paradox-gray-400">
            {lipsyncMetadata.map(([label, value]) => (
              <p key={label}>
                <span className="text-paradox-gray-500">{label}:</span> {value}
              </p>
            ))}
          </div>
          <div className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40 p-3 text-[11px] text-paradox-gray-300">
            <p className="text-[10px] uppercase tracking-[0.3em] text-paradox-gray-500">
              Disclosure
            </p>
            <p>
              Character: {lipsyncData.disclosure.original_character_reference}
            </p>
            <p>Label: {lipsyncData.disclosure.disclosure_label}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
