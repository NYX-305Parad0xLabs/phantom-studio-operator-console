"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockPublishTargets } from "@/lib/publish/mock";

export function PublishScheduler() {
  const [target, setTarget] = useState(mockPublishTargets[0].id);
  const [schedule, setSchedule] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "scheduled">("idle");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!schedule) {
      return;
    }
    setStatus("scheduled");
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
            Publish scheduling
          </p>
          <p className="text-lg font-semibold text-white">Prepare outbound job</p>
        </div>
        <Badge variant="accent" className="text-[10px]">
          Manual
        </Badge>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="platform-select">Platform target</label>
          <select
            id="platform-select"
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            {mockPublishTargets.map((option) => (
              <option key={option.id} value={option.id}>
                {option.platform} · {option.account} ({option.label})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="schedule-input">Schedule time (UTC)</label>
          <input
            id="schedule-input"
            type="datetime-local"
            value={schedule}
            onChange={(event) => setSchedule(event.target.value)}
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="title-override">Title override</label>
          <input
            id="title-override"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional title"
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-1 text-xs uppercase tracking-[0.3em] text-paradox-gray-500">
          <label htmlFor="caption-override">Caption override</label>
          <textarea
            id="caption-override"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Optional caption"
            rows={2}
            className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary">
            {status === "scheduled" ? "Scheduled" : "Schedule publish"}
          </Button>
          <p className="text-xs text-paradox-gray-400">
            Publishing requires an approved review decision before this form enables scheduling.
          </p>
        </div>
      </form>
    </Card>
  );
}
