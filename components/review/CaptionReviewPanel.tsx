"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  captionStylePresets,
  mockCaptionArtifact,
  mockCaptionTranslations,
} from "@/lib/review/caption";
import {
  ProviderGatewayClient,
  type CaptionPlanRead,
  type TranslationBatchRead,
} from "@/lib/api/providerGateway";
import {
  defaultProviderCaptionId,
  integrationMode,
  providerTranslationTargets,
} from "@/lib/config";
import { usesLiveProviderFlow } from "@/lib/provider/state";

type DisplayCue = {
  id: string;
  cueIndex: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
  emphasisWords: string[];
  emojiSuggestions: string[];
};

type TranslationEntry = {
  id: string;
  label: string;
  qualityNote?: string;
  cues: Array<{
    cueIndex?: number;
    cueId?: string;
    translatedText: string;
  }>;
};

const formatSeconds = (value: number) => `${value.toFixed(1)}s`;

const buildMockCues = (): DisplayCue[] =>
  mockCaptionArtifact.cues.map((cue, index) => ({
    id: cue.id,
    cueIndex: index + 1,
    startSeconds: cue.startSeconds,
    endSeconds: cue.endSeconds,
    text: cue.text,
    emphasisWords: cue.emphasisWords,
    emojiSuggestions: cue.emojiSuggestions,
  }));

const buildLiveCues = (plan: CaptionPlanRead): DisplayCue[] =>
  plan.cues.map((cue) => ({
    id: `cue-${cue.cue_index}`,
    cueIndex: cue.cue_index,
    startSeconds: cue.start_seconds,
    endSeconds: cue.end_seconds,
    text: cue.text,
    emphasisWords: cue.punch_words,
    emojiSuggestions: cue.emoji_suggestions,
  }));

const buildMockTranslations = (): TranslationEntry[] =>
  mockCaptionTranslations.map((translation) => ({
    id: translation.id,
    label: translation.displayName,
    qualityNote: translation.qualityNotes,
    cues: translation.cues.map((entry) => ({
      cueId: entry.cueId,
      translatedText: entry.text,
    })),
  }));

const buildLiveTranslations = (
  translations: TranslationBatchRead["translations"],
): TranslationEntry[] =>
  translations.map((translation) => ({
    id: `translation-${translation.translation_id}`,
    label: translation.target_label ?? translation.target_language_code,
    qualityNote: translation.quality_notes
      .map((note) => note.detail)
      .filter(Boolean)
      .join(" "),
    cues: translation.cues.map((cue) => ({
      cueIndex: cue.cue_index,
      translatedText: cue.translated_text,
    })),
  }));

export function CaptionReviewPanel() {
  const [approved, setApproved] = useState(false);
  const [flaggedCueId, setFlaggedCueId] = useState<string | null>(null);
  const [stylePresetId, setStylePresetId] = useState(
    mockCaptionArtifact.stylePreset.id,
  );
  const [activeTranslationId, setActiveTranslationId] = useState("source");

  const showLiveCaptions =
    usesLiveProviderFlow() &&
    integrationMode === "live" &&
    defaultProviderCaptionId > 0;

  const captionQuery = useQuery({
    queryKey: ["provider-caption", defaultProviderCaptionId],
    queryFn: () => ProviderGatewayClient.fetchCaptionPlan(defaultProviderCaptionId),
    enabled: showLiveCaptions,
  });

  const translationQuery = useQuery({
    queryKey: [
      "provider-translations",
      captionQuery.data?.caption_id,
      providerTranslationTargets.join(","),
    ],
    queryFn: () =>
      ProviderGatewayClient.requestTranslationBatch(captionQuery.data!.caption_id, {
        targetLanguages: providerTranslationTargets,
        includeSrt: true,
      }),
    enabled:
      showLiveCaptions &&
      Boolean(captionQuery.data) &&
      providerTranslationTargets.length > 0,
  });

  const liveCues = useMemo(
    () => (captionQuery.data ? buildLiveCues(captionQuery.data) : undefined),
    [captionQuery.data],
  );

  const displayCues = liveCues ?? buildMockCues();

  const mockTranslations = useMemo(() => buildMockTranslations(), []);
  const liveTranslations = useMemo(
    () =>
      translationQuery.data?.translations
        ? buildLiveTranslations(translationQuery.data.translations)
        : [],
    [translationQuery.data],
  );

  const hasLiveTranslation =
    Boolean(liveTranslations.length) && Boolean(liveCues);

  const translationTabs = useMemo(
    () => [
      { id: "source", label: "Source", qualityNote: undefined, cues: [] },
      ...(hasLiveTranslation ? liveTranslations : mockTranslations),
    ],
    [hasLiveTranslation, liveTranslations, mockTranslations],
  );

  const translationMap = useMemo(() => {
    const map = new Map<string | number, string>();
    if (activeTranslationId !== "source") {
      const entry = translationTabs.find((tab) => tab.id === activeTranslationId);
      entry?.cues.forEach((cue) => {
        if (cue.cueIndex != null) {
          map.set(cue.cueIndex, cue.translatedText);
        }
        if (cue.cueId) {
          map.set(cue.cueId, cue.translatedText);
        }
      });
    }
    return map;
  }, [activeTranslationId, translationTabs]);

  const translationRows = displayCues.map((cue) => ({
    ...cue,
    translatedText:
      activeTranslationId === "source"
        ? cue.text
        : translationMap.get(cue.cueIndex) ??
          translationMap.get(cue.id) ??
          cue.text,
  }));

  const preset = captionStylePresets.find(
    (entry) => entry.id === stylePresetId,
  ) ?? captionStylePresets[0];

  const liveStyle = captionQuery.data?.style;

  const styleLabel = liveStyle ? liveStyle.name : preset.name;
  const stylePaletteHint = liveStyle
    ? `${liveStyle.text_color} on ${liveStyle.background_color}`
    : preset.paletteHint;
  const styleDescription = liveStyle?.description ?? preset.description;

  const overlayText = displayCues[0]?.text ?? mockCaptionArtifact.cues[0].text;
  const overlayHint =
    captionQuery.data?.context_note ?? mockCaptionArtifact.overlayHint;

  const captionModeLabel = captionQuery.data ? "Live captions" : "Mock captions";
  const captionModeVariant = captionQuery.data ? "success" : "muted";
  const translationModeLabel = hasLiveTranslation
    ? "Live translations"
    : "Mock translations";
  const translationModeVariant = hasLiveTranslation ? "success" : "muted";

  const activeTranslation = translationTabs.find(
    (entry) => entry.id === activeTranslationId,
  );

  const translationQuality = activeTranslation?.qualityNote;

  const cyclePreset = () => {
    const currentIndex = captionStylePresets.findIndex(
      (entry) => entry.id === stylePresetId,
    );
    const nextIndex = (currentIndex + 1) % captionStylePresets.length;
    setStylePresetId(captionStylePresets[nextIndex].id);
  };

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
            Caption Review
          </p>
          <h2 className="text-xl font-semibold text-white">
            Timed captions & localization
          </h2>
        </div>
        <Badge variant="accent">{styleLabel}</Badge>
        <Badge variant="muted">{stylePaletteHint}</Badge>
        <div className="flex flex-wrap gap-2">
          <Badge variant={captionModeVariant} className="text-[10px] uppercase">
            {captionModeLabel}
          </Badge>
          <Badge variant={translationModeVariant} className="text-[10px] uppercase">
            {translationModeLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {displayCues.map((cue) => {
            const flagged = flaggedCueId === cue.id;
            return (
              <div
                key={cue.id}
                className={`rounded-2xl border px-4 py-3 transition ${
                  flagged
                    ? "border-paradox-emerald bg-paradox-gray-900/70"
                    : "border-paradox-gray-700/80 bg-paradox-gray-900/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-paradox-gray-500">
                    {cue.id} • {formatSeconds(cue.startSeconds)} ↦{" "}
                    {formatSeconds(cue.endSeconds)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFlaggedCueId(cue.id)}
                    className="text-[11px] uppercase tracking-[0.3em]"
                  >
                    Flag cue for rewrite
                  </Button>
                </div>
                <p className="mt-3 text-sm text-white">“{cue.text}”</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-paradox-gray-400">
                  {cue.emphasisWords.map((word) => (
                    <span
                      key={word}
                      className="rounded-full border border-paradox-gray-600 px-2 py-1 text-[10px]"
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-paradox-gray-400">
                  Emojis: {cue.emojiSuggestions.join(" ")}
                </div>
                {flagged && (
                  <Badge variant="outline" className="mt-3">
                    Flagged for rewrite
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 border border-paradox-gray-700/80">
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
              Preview overlay
            </p>
            <div className="relative h-40 overflow-hidden rounded-2xl border border-paradox-gray-700/90 bg-black/40">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 space-y-1 text-white">
                <p className="text-[11px] uppercase tracking-[0.5em] text-paradox-gray-500">
                  {styleDescription}
                </p>
                <p className="text-lg font-semibold">{overlayText}</p>
              </div>
            </div>
            <p className="text-xs text-paradox-gray-400">{overlayHint}</p>
          </Card>
          <Card className="space-y-3 border border-paradox-gray-700/80">
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
              Translation tabs
            </p>
            <div className="flex flex-wrap gap-2">
              {translationTabs.map((translation) => (
                <Button
                  key={translation.id}
                  type="button"
                  variant={activeTranslationId === translation.id ? "outline" : "ghost"}
                  onClick={() => setActiveTranslationId(translation.id)}
                >
                  {translation.label}
                </Button>
              ))}
            </div>
            {translationQuality && (
              <Badge variant="outline" className="text-[9px]">
                {translationQuality}
              </Badge>
            )}
          </Card>
          <Card className="space-y-4 border border-paradox-gray-700/80">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Localized cues</p>
              <Badge variant="muted">Diff</Badge>
            </div>
            <div className="space-y-3">
              {translationRows.map((row) => (
                <div
                  key={`${row.id}-${row.cueIndex}`}
                  className="space-y-2 rounded-xl border border-paradox-gray-700/60 bg-paradox-gray-800/40 p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.4em] text-paradox-gray-500">
                    {row.id} • {formatSeconds(row.startSeconds)} ↦{" "}
                    {formatSeconds(row.endSeconds)}
                  </p>
                  <div className="grid gap-2 lg:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase text-paradox-gray-400">Source</p>
                      <p className="text-sm text-white">“{row.text}”</p>
                    </div>
                    {activeTranslationId !== "source" && (
                      <div>
                        <p className="text-[10px] uppercase text-paradox-emerald">
                          Localized
                        </p>
                        <p className="text-sm text-white">
                          “{row.translatedText}”
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setApproved((prev) => !prev)}
          variant={approved ? "outline" : "primary"}
        >
          {approved ? "Captions approved" : "Approve captions"}
        </Button>
        {!liveCues && (
          <Button type="button" variant="ghost" onClick={cyclePreset}>
            Switch style preset
          </Button>
        )}
        {flaggedCueId && (
          <p className="text-xs text-paradox-gray-400">
            Flagged {flaggedCueId} for rewrite.
          </p>
        )}
      </div>
    </Card>
  );
}
