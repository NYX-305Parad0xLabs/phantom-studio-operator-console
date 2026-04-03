"use client";

import { Button } from "@/components/ui/button";

type PlaceholderContentProps = {
  highlight: string;
  children: React.ReactNode;
};

export function PlaceholderContent({ highlight, children }: PlaceholderContentProps) {
  return (
    <div className="space-y-2 text-sm text-paradox-gray-300">
      <p className="text-sm text-paradox-emerald">{highlight}</p>
      <div className="space-y-1">{children}</div>
      <Button variant="ghost" className="text-xs uppercase tracking-[0.4em]">
        Explore
      </Button>
    </div>
  );
}
