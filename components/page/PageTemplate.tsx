"use client";

import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
type PageTemplateProps = {
  title: string;
  subtitle: string;
  sections: { title: string; detail: string }[];
  ctadesc?: string;
  children?: ReactNode;
};

export function PageTemplate({
  title,
  subtitle,
  sections,
  children,
}: PageTemplateProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          {title}
        </p>
        <p className="text-2xl font-semibold text-white">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <p className="text-sm font-semibold text-white">{section.title}</p>
            <p className="text-xs text-paradox-gray-400">{section.detail}</p>
          </Card>
        ))}
      </div>
      {children}
    </div>
  );
}
