"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ControlPlaneClient, type WorkflowRunSummary } from "@/lib/api/controlPlane";
import { submitIntakeRun } from "@/lib/intake/service";
import {
  IntakeFormValues,
  intakeSchema,
  languageOptions,
  platformOptions,
} from "@/lib/intake/schema";

const defaultValues: IntakeFormValues = {
  sourceType: "url",
  sourceUrl: "",
  uploadReference: "",
  projectName: "",
  clipMode: "single_best",
  targetPlatforms: [],
  targetLanguages: [],
  styleNotes: "",
  syntheticEnabled: false,
  syntheticDisclosure: "",
  syntheticVoice: "",
};

export default function IntakePage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const {
  register,
  handleSubmit,
  reset,
  control,
  formState: { errors },
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues,
  });
  const sourceType = useWatch({ control, name: "sourceType" });
  const syntheticEnabled = useWatch({ control, name: "syntheticEnabled" });

  const runsQuery = useQuery({
    queryKey: ["runs"],
    queryFn: ControlPlaneClient.listRuns,
    placeholderData: [],
  });

  const submission = useMutation<WorkflowRunSummary, Error, IntakeFormValues>({
    mutationFn: submitIntakeRun,
    onSuccess: () => {
      setStatusMessage("Intake submitted successfully. Run queued.");
      reset(defaultValues);
    },
    onError: () => {
      setStatusMessage("Unable to submit intake. Please try again.");
    },
  });

  const sourceLabel = useMemo(
    () => (sourceType === "url" ? "Source URL" : "Uploaded reference"),
    [sourceType],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-paradox-gray-500">
          Intake
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Submit a source for Phantom Studio
        </h1>
        <p className="text-sm text-paradox-gray-400">
          Capture the core intent before handing the job to the control plane.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => submission.mutate(values))}
          >
            <section className="space-y-2">
              <p className="text-sm font-semibold text-white">Source</p>
              <div className="flex gap-4">
                {["url", "upload"].map((type) => (
                  <label key={type} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={type}
                      {...register("sourceType")}
                      className="h-4 w-4"
                    />
                    <span className="capitalize text-paradox-gray-300">{type}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                  {sourceLabel}
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/source.mp4"
                  {...register(sourceType === "url" ? "sourceUrl" : "uploadReference")}
                  className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-800 px-4 py-2 text-sm text-white outline-none focus:border-paradox-accent"
                />
                <p className="text-xs text-paradox-amber">
                  {errors[sourceType === "url" ? "sourceUrl" : "uploadReference"]
                    ? errors[sourceType === "url" ? "sourceUrl" : "uploadReference"]?.message
                    : "Provide a URL or uploaded asset reference for the provider gateway."}
                </p>
              </div>
            </section>

            <section className="space-y-1">
              <label className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                Project name
              </label>
              <input
                type="text"
                placeholder="Original Creator Campaign"
                {...register("projectName")}
                className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-800 px-4 py-2 text-sm text-white outline-none focus:border-paradox-accent"
              />
              <p className="text-xs text-paradox-amber">
                {errors.projectName?.message}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                  Clip mode
                </p>
                <select
                  {...register("clipMode")}
                  className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-800 px-4 py-2 text-sm text-white"
                >
                  <option value="single_best">One killer short</option>
                  <option value="series_max_3">Series (up to 3 clips)</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                  Target platforms
                </p>
                <div className="flex flex-wrap gap-3">
                  {platformOptions.map((platform) => (
                    <label
                      key={platform}
                      className="cursor-pointer rounded-2xl border border-paradox-gray-700 px-3 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        value={platform}
                        {...register("targetPlatforms")}
                        className="mr-2"
                      />
                      {platform}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-paradox-amber">
                  {errors.targetPlatforms?.message}
                </p>
              </div>
            </section>

            <section className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                Target languages
              </p>
              <div className="flex flex-wrap gap-3">
                {languageOptions.map((language) => (
                  <label
                    key={language}
                    className="cursor-pointer rounded-full border border-paradox-gray-700 px-3 py-1 text-xs uppercase"
                  >
                    <input
                      type="checkbox"
                      value={language}
                      {...register("targetLanguages")}
                      className="mr-2"
                    />
                    {language}
                  </label>
                ))}
              </div>
              <p className="text-xs text-paradox-amber">
                {errors.targetLanguages?.message}
              </p>
            </section>

            <section className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-paradox-gray-500">
                Style notes
              </p>
              <textarea
                rows={3}
                placeholder="Urgent, high energy, anchor the hook in the first 3 seconds."
                {...register("styleNotes")}
                className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-800 px-4 py-2 text-sm text-white outline-none focus:border-paradox-accent"
              />
            </section>

            <section className="space-y-1">
              <label className="flex items-center gap-3 text-sm font-semibold text-white">
                <input
                  type="checkbox"
                  {...register("syntheticEnabled")}
                  className="h-4 w-4"
                />
                Synthetic media preferences (disclosed creators only)
              </label>
              {syntheticEnabled && (
                <div className="space-y-2 border border-paradox-gray-800/80 p-3">
                  <input
                    type="text"
                    placeholder="Disclosure label"
                    {...register("syntheticDisclosure")}
                    className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-4 py-2 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Preferred voice profile"
                    {...register("syntheticVoice")}
                    className="w-full rounded-2xl border border-paradox-gray-700 bg-paradox-gray-900 px-4 py-2 text-sm text-white"
                  />
                </div>
              )}
              <p className="text-xs text-paradox-amber">
                {syntheticEnabled ? errors.syntheticDisclosure?.message : ""}
              </p>
            </section>

            <div className="flex items-center justify-between">
              <Button
                type="submit"
                disabled={submission.isPending}
                variant="primary"
              >
                {submission.isPending ? "Submitting..." : "Create intake run"}
              </Button>
              {statusMessage && (
                <Badge variant="success" className="text-xs">
                  {statusMessage}
                </Badge>
              )}
            </div>
            {submission.isError && (
              <p className="text-sm text-paradox-amber">
                Unable to submit intake. Please retry.
              </p>
            )}
          </form>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Recent jobs</p>
            <Badge className="text-xs uppercase tracking-[0.3em]">Live</Badge>
          </div>
          {!runsQuery.data?.length && (
            <p className="text-sm text-paradox-gray-400">No recent jobs yet.</p>
          )}
          <ul className="space-y-3">
            {runsQuery.data?.slice(0, 5).map((run) => (
              <li key={run.id} className="space-y-1 rounded-2xl border border-paradox-gray-800/80 p-3">
                <p className="text-sm font-semibold text-white">{run.project}</p>
                <p className="text-xs text-paradox-gray-400">
                  Stage: {run.stage} · Status: {run.status}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
