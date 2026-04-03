"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipCard } from "@/components/review/ClipCard";
import { CaptionReviewPanel } from "@/components/review/CaptionReviewPanel";
import { mockClipCandidates } from "@/lib/review/clip";

type CompareMode = "single" | "compare";

export default function ReviewPage() {
  const [selectedId, setSelectedId] = useState(mockClipCandidates[0].id);
  const [compareMode, setCompareMode] = useState<CompareMode>("single");
  const [compareSet, setCompareSet] = useState<string[]>([]);

  const selectedClip = mockClipCandidates.find(
    (candidate) => candidate.id === selectedId,
  );

  const toggleCompare = (id: string) => {
    setCompareSet((prev) => {
      if (prev.includes(id)) {
        return prev.filter((entry) => entry !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          Clip Review
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Select the highest impact viral short
        </h1>
        <p className="text-sm text-paradox-gray-400">
          Inspect transcript alignment and rationale before approving or requesting alternates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                Candidates
              </p>
              <p className="text-sm text-paradox-gray-400">
                Tap a card to preview, or toggle compare mode for up to 3.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={compareMode === "single" ? "outline" : "ghost"}
                onClick={() => setCompareMode("single")}
              >
                Single
              </Button>
              <Button
                type="button"
                variant={compareMode === "compare" ? "outline" : "ghost"}
                onClick={() => setCompareMode("compare")}
              >
                Compare
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {mockClipCandidates.map((candidate) => {
              const selected = candidate.id === selectedId;
              return (
                <div key={candidate.id}>
                  <ClipCard
                    candidate={candidate}
                    selected={selected}
                    onSelect={() => setSelectedId(candidate.id)}
                  />
                  {compareMode === "compare" && (
                    <label className="flex items-center gap-2 text-xs text-paradox-gray-400">
                      <input
                        type="checkbox"
                        checked={compareSet.includes(candidate.id)}
                        onChange={() => toggleCompare(candidate.id)}
                        className="h-4 w-4"
                        aria-label="Compare candidate"
                      />
                      Include in compare
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Preview</p>
              <Badge variant="muted" className="text-[10px] uppercase tracking-[0.4em]">
                {compareMode === "compare" ? `${compareSet.length} clips` : "Single clip"}
              </Badge>
            </div>
            <div className="mt-4 aspect-video rounded-2xl border border-paradox-gray-700/80 bg-black/40" />
            <div className="mt-3 flex items-center gap-2 text-xs text-paradox-gray-400">
              <span>Illustrative preview for {selectedClip?.platformHint}</span>
              <span>·</span>
              <span>{selectedClip?.durationSeconds}s clip</span>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                Transcript alignment
              </p>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.3em]">
                Verified
              </Badge>
            </div>
            <p className="text-sm text-paradox-gray-200">
              {selectedClip?.transcriptExcerpt}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-paradox-gray-400">
              <span>Start: {selectedClip?.startSeconds}s</span>
              <span>End: {selectedClip?.endSeconds}s</span>
            </div>
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-white">Operator actions</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button">Accept candidate</Button>
              <Button type="button" variant="ghost">
                Request alternate
              </Button>
              <Button type="button" variant="outline">
                Mark order
              </Button>
            </div>
            <p className="text-xs text-paradox-gray-500">
              Compare mode lets you assign ordering for a series. Select the preferred sequence before accepting.
            </p>
          </Card>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
            Caption Review
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Inspect captions & localization
          </h2>
          <p className="text-sm text-paradox-gray-400">
            Timed cues, overlay previews, and translation diffs are surfaced so
            operators can approve or request rewrites.
          </p>
        </div>
        <CaptionReviewPanel />
      </section>
    </div>
  );
}
