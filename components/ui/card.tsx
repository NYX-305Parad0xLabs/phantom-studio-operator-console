"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-paradox-gray-800 bg-paradox-surface px-6 py-5 shadow-sm shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
