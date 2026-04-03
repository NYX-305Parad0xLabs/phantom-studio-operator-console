"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ControlPlaneClient } from "@/lib/api/controlPlane";
import { isLiveIntegration } from "@/lib/config";
import {
  decisionTypes,
  DecisionType,
  DecisionPayload,
  mockArtifactScopes,
} from "@/lib/review/decision";

type DecisionStatus = "idle" | "submitting" | "success" | "error";

export function DecisionPanel({ runId }: { runId: string }) {
  const [selectedType, setSelectedType] = useState<DecisionType>("approve");
  const [notes, setNotes] = useState("");
  const [scope, setScope] = useState(mockArtifactScopes[0]);
  const [status, setStatus] = useState<DecisionStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleDecision = async () => {
    setStatus("submitting");
    setMessage(null);
    const payload: DecisionPayload = {
      decisionType: selectedType,
      notes,
      artifactScope: scope,
    };

    const runNumber = Number(runId);
    if (Number.isNaN(runNumber)) {
      setStatus("error");
      setMessage("Invalid run identifier.");
      return;
    }
    try {
      if (selectedType === "approve") {
        await ControlPlaneClient.approveRun(runNumber, payload);
      } else if (selectedType === "reject") {
        await ControlPlaneClient.rejectRun(runNumber, payload);
      } else {
        await ControlPlaneClient.requestRegenerate(runNumber, payload);
      }
      setStatus("success");
      setMessage(`${selectedType} recorded for ${scope}.`);
    } catch {
      setStatus("error");
      setMessage("Failed to submit decision. Try again.");
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
            Operator decision
          </p>
          <p className="text-lg font-semibold text-white">Approve / Reject / Regenerate</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-[10px]">
            Auditable
          </Badge>
          <Badge
            variant={isLiveIntegration ? "success" : "muted"}
            className="text-[10px] uppercase tracking-[0.3em]"
          >
            {isLiveIntegration ? "Live writes" : "Mock writes"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {decisionTypes.map((decision) => (
          <Button
            key={decision.id}
            type="button"
            variant={selectedType === decision.id ? "outline" : "ghost"}
            onClick={() => setSelectedType(decision.id)}
          >
            {decision.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          Artifact scope
        </label>
        <select
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
        >
          {mockArtifactScopes.map((artifact) => (
            <option key={artifact} value={artifact}>
              {artifact}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Add rationale or request details"
          className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-paradox-accent/40"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={handleDecision}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Submitting…" : "Submit decision"}
        </Button>
        {message && (
          <span
            className={`text-sm ${
              status === "error" ? "text-paradox-amber" : "text-paradox-emerald"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </Card>
  );
}
