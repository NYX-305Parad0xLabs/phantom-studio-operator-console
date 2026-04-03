"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export type PageSectionProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <Card className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-400">
          {title}
        </p>
        <p className="text-lg font-semibold text-white">{description}</p>
      </div>
      {children}
    </Card>
  );
}
