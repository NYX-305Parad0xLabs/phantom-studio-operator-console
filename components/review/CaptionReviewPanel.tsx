"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  captionStylePresets,
  mockCaptionArtifact,
  mockCaptionTranslations,
} from "@/lib/review/caption";

function formatSeconds(value: number) {
  return `${value.toFixed(1)}s`;
}

export function CaptionReviewPanel() {
  const [approved, setApproved] = useState(false);
  const [flaggedCueId, setFlaggedCueId] = useState<string | null>(null);
  const [stylePresetId, setStylePresetId] = useState(
    mockCaptionArtifact.stylePreset.id,
  );
  const [activeTranslationId, setActiveTranslationId] = useState("source");

  const preset = captionStylePresets.find((entry) => entry.id === stylePresetId)
    ?? captionStylePresets[0];

  const cyclePreset = () => {
    const currentIndex = captionStylePresets.findIndex(
      (entry) => entry.id === stylePresetId,
    );
    const nextIndex = (currentIndex + 1) % captionStylePresets.length;
    setStylePresetId(captionStylePresets[nextIndex].id);
  };

  const translationRows = useMemo(() => {
    if (activeTranslationId === "source") {
      return mockCaptionArtifact.cues.map((cue) => ({
        cueId: cue.id,
        startSeconds: cue.startSeconds,
        endSeconds: cue.endSeconds,
        baseText: cue.text,
        translatedText: cue.text,
      }));
    }

    const translation = mockCaptionTranslations.find(
      (entry) => entry.id === activeTranslationId,
    );

    if (!translation) {
      return [];
    }

    return translation.cues.map((entry) => {
      const sourceCue = mockCaptionArtifact.cues.find(
        (cue) => cue.id === entry.cueId,
      );

      return {
        cueId: entry.cueId,
        startSeconds: sourceCue?.startSeconds ?? 0,
        endSeconds: sourceCue?.endSeconds ?? 0,
        baseText: sourceCue?.text ?? "",
        translatedText: entry.text,
      };
    });
  }, [activeTranslationId]);

  const activeTranslation = mockCaptionTranslations.find(
    (entry) => entry.id === activeTranslationId,
  );

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
        <Badge variant="accent">{preset.name}</Badge>
        <Badge variant="muted">{preset.paletteHint}</Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {mockCaptionArtifact.cues.map((cue) => {
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
                  {preset.description}
                </p>
                <p className="text-lg font-semibold">
                  {mockCaptionArtifact.cues[0].text}
                </p>
              </div>
            </div>
            <p className="text-xs text-paradox-gray-400">
              {mockCaptionArtifact.overlayHint}
            </p>
          </Card>
          <Card className="space-y-3 border border-paradox-gray-700/80">
            <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
              Translation tabs
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={activeTranslationId === "source" ? "outline" : "ghost"}
                onClick={() => setActiveTranslationId("source")}
              >
                Source
              </Button>
              {mockCaptionTranslations.map((translation) => (
                <Button
                  key={translation.id}
                  type="button"
                  variant={
                    activeTranslationId === translation.id ? "outline" : "ghost"
                  }
                  onClick={() => setActiveTranslationId(translation.id)}
                >
                  {translation.displayName}
                </Button>
              ))}
            </div>
            {activeTranslation && (
              <Badge variant="outline" className="text-[9px]">
                {activeTranslation.qualityNotes}
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
                  key={row.cueId}
                  className="space-y-2 rounded-xl border border-paradox-gray-700/60 bg-paradox-gray-800/40 p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.4em] text-paradox-gray-500">
                    {row.cueId} • {formatSeconds(row.startSeconds)} ↦{" "}
                    {formatSeconds(row.endSeconds)}
                  </p>
                  <div className="grid gap-2 lg:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase text-paradox-gray-400">
                        Source
                      </p>
                      <p className="text-sm text-white">“{row.baseText}”</p>
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
        <Button type="button" variant="ghost" onClick={cyclePreset}>
          Switch style preset
        </Button>
        {flaggedCueId && (
          <p className="text-xs text-paradox-gray-400">
            Flagged {flaggedCueId} for rewrite.
          </p>
        )}
      </div>
    </Card>
  );
}
