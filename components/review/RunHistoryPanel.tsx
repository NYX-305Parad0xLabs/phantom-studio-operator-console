"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockRunHistory, RunHistoryEvent } from "@/lib/runs/history";

const eventVariant: Record<RunHistoryEvent["type"], "muted" | "accent" | "success"> = {
  qa: "muted",
  review: "accent",
  approval: "success",
};

export function RunHistoryPanel() {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">Run history</p>
        <Badge variant="muted" className="text-[10px]">
          Chronicle
        </Badge>
      </div>
      <div className="space-y-3">
        {mockRunHistory.map((event) => (
          <div key={event.id} className="rounded-2xl border border-paradox-gray-700/80 bg-paradox-gray-900/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{event.title}</p>
                <p className="text-xs text-paradox-gray-400">
                  {new Date(event.timestamp).toLocaleString()} · {event.author}
                </p>
              </div>
              <Badge variant={eventVariant[event.type]} className="text-[10px]">
                {event.outcome ?? event.type}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-paradox-gray-200">{event.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
