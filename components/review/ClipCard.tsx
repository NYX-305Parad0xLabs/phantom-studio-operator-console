"use client";

import { Badge } from "@/components/ui/badge";
import type { ClipCandidate } from "@/lib/review/clip";

type ClipCardProps = {
  candidate: ClipCandidate;
  selected: boolean;
  onSelect: () => void;
};

export function ClipCard({ candidate, selected, onSelect }: ClipCardProps) {
  return (
    <div
      className={`rounded-2xl border border-paradox-gray-700/80 p-4 transition hover:border-paradox-accent ${
        selected ? "bg-paradox-gray-900 shadow-lg shadow-black/40" : "bg-paradox-gray-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          {candidate.startSeconds}s — {candidate.endSeconds}s
        </p>
        {candidate.bestClip && (
          <Badge variant="success" className="text-[10px]">
            Best Clip
          </Badge>
        )}
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
        Score {candidate.score.toFixed(1)} · {candidate.platformHint}
      </p>
      <p className="mt-3 text-sm text-paradox-gray-200">{candidate.rationale}</p>
      <blockquote className="mt-4 rounded-xl border border-paradox-gray-700/70 p-3 text-sm text-paradox-gray-300">
        “{candidate.transcriptExcerpt}”
      </blockquote>
      <p className="mt-2 text-xs text-paradox-gray-500">{candidate.styleNotes}</p>
      <button
        type="button"
        onClick={onSelect}
        className="mt-4 inline-flex items-center justify-center rounded-2xl bg-paradox-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-paradox-emerald"
      >
        {selected ? "Selected" : "View clip"}
      </button>
    </div>
  );
}
