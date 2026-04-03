"use client";

import { cn } from "@/lib/utils";

export type BadgeProps = {
  variant?: "muted" | "accent" | "success";
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<Required<BadgeProps>["variant"], string> = {
  muted: "bg-paradox-gray-700 text-white",
  accent: "bg-paradox-accent/80 text-white",
  success: "bg-paradox-emerald/80 text-black",
};

export function Badge({ variant = "muted", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
