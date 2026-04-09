import { type FactoryUiStateLabel } from "@/lib/api/controlPlane";

const STYLE_MAP: Record<FactoryUiStateLabel, string> = {
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  mocked: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  failed: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  waiting_for_review: "border-sky-500/40 bg-sky-500/10 text-sky-200",
};

const LABEL_MAP: Record<FactoryUiStateLabel, string> = {
  live: "Live",
  mocked: "Mocked",
  failed: "Failed",
  waiting_for_review: "Waiting for review",
};

type FactoryStateBadgeProps = {
  state: FactoryUiStateLabel;
};

export function FactoryStateBadge({ state }: FactoryStateBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STYLE_MAP[state]}`}
    >
      {LABEL_MAP[state]}
    </span>
  );
}
