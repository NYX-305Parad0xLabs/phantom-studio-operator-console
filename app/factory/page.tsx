"use client";

import { type ChangeEvent, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlPlaneClient,
  type FactoryPlanResponse,
  type UGCPostTaskResponse,
} from "@/lib/api/controlPlane";
import {
  ProviderGatewayClient,
  type MultiShotJobStatusResponse,
  type MultiShotVideoResponse,
} from "@/lib/api/providerGateway";
import { defaultWorkflowRunId } from "@/lib/config";

const DEFAULT_RUN_ID = defaultWorkflowRunId > 0 ? defaultWorkflowRunId : 1;

const DEFAULT_FORM = {
  name: "Parad0x Velvet Glow Foundation",
  influencer: "luna-v2",
  backend: "kling",
};
const FRIENDLY_ERROR = "Something went wrong - please try again.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyProgressMessage(raw: string) {
  const text = raw.toLowerCase();
  if (text.includes("prepare") || text.includes("queued")) return "Writing the script...";
  if (text.includes("scene") || text.includes("generating")) return "Making the video scenes...";
  if (text.includes("stitch")) return "Putting it all together...";
  if (text.includes("disclosure") || text.includes("final")) return "Almost done!";
  if (text.includes("complete")) return "Your video is ready!";
  return raw || "Working on your video...";
}

export default function FactoryPage() {
  const [runId, setRunId] = useState<number>(DEFAULT_RUN_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState("Ready when you are.");
  const [progressPercent, setProgressPercent] = useState(0);
  const [plan, setPlan] = useState<FactoryPlanResponse | null>(null);
  const [render, setRender] = useState<MultiShotVideoResponse | null>(null);
  const [variants, setVariants] = useState<MultiShotVideoResponse[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<UGCPostTaskResponse | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const planPayload = useMemo(
    () => ({
      productName: form.name,
      finishGoal: "soft-matte",
      influencerLockId: form.influencer,
      targetPlatforms: ["tiktok", "instagram_reels"],
      targetDurationSeconds: 22,
      visualStyle: "high-key beauty studio lighting, handheld social framing",
      startFrameReference: referenceImageUrl || "file://refs/makeup-start.png",
      endFrameReference: referenceImageUrl || "file://refs/makeup-end.png",
      callToAction: "Tap to shop and always label this as synthetic UGC.",
      videoBackend: form.backend,
    }),
    [form, referenceImageUrl],
  );

  async function uploadReferenceFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      setProgressMessage("Uploading reference image...");
      const uploaded = await ProviderGatewayClient.uploadReferenceImage(file);
      setReferenceImageUrl(uploaded.reference_image_url);
      setReferencePreview(URL.createObjectURL(file));
      setSuccess("Reference image added.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : FRIENDLY_ERROR);
    } finally {
      setProgressMessage("Ready when you are.");
    }
  }

  async function waitForVideoJob(jobId: string): Promise<MultiShotVideoResponse> {
    for (;;) {
      const status: MultiShotJobStatusResponse = await ProviderGatewayClient.getMultiShotJob(jobId);
      setProgressMessage(friendlyProgressMessage(status.message || "Working..."));
      setProgressPercent(status.progress_percent ?? 0);
      if (status.status === "completed" && status.result) {
        return status.result;
      }
      if (status.status === "failed") {
        throw new Error(status.error || "Video job failed");
      }
      await sleep(1200);
    }
  }

  async function publishCurrentOutput() {
    if (!render) return;
    try {
      const posted = await ControlPlaneClient.postFactoryOutput(runId, {
        stitchedVideoUri: render.stitched_video_uri,
        metadataUri: render.metadata_uri ?? undefined,
        targetPlatforms: planPayload.targetPlatforms,
        provenance: {
          ...(render.provenance ?? {}),
          disclosure_text: render.disclosure_text,
          synthetic: true,
        },
      });
      setPublishResult(posted);
      setSuccess("📤 Publish task queued.");
      setTimeout(() => setSuccess(null), 3200);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : FRIENDLY_ERROR);
    }
  }

  async function runFactoryFlow(variantCount = 1) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPublishResult(null);
    setProgressMessage("Writing the script...");
    setProgressPercent(5);
    try {
      let activeRunId = runId;
      try {
        await ControlPlaneClient.fetchRunDetail(activeRunId);
      } catch {
        activeRunId = await ControlPlaneClient.createFactoryRun("Phantom Studio Factory Demo");
        setRunId(activeRunId);
      }

      const nextPlan = await ControlPlaneClient.createFactoryPlan(activeRunId, planPayload);
      setPlan(nextPlan);
      setProgressMessage("Making the video scenes...");
      setProgressPercent(10);

      const generated: MultiShotVideoResponse[] = [];
      for (let index = 0; index < variantCount; index += 1) {
        const variantNum = index + 1;
        const create = await ProviderGatewayClient.createMultiShotJob({
          workflowRunId: nextPlan.workflow_run_id,
          influencerLockId: nextPlan.influencer_lock_id,
          productName: nextPlan.product_name,
          videoBackend: nextPlan.selected_video_backend,
          targetPlatforms: planPayload.targetPlatforms,
          referenceImageUrl: referenceImageUrl || undefined,
          scenes: nextPlan.scenes.map((scene) => ({
            ...scene,
            start_frame_reference: scene.start_frame_reference ?? referenceImageUrl ?? null,
            end_frame_reference: scene.end_frame_reference ?? referenceImageUrl ?? null,
            prompt: `${scene.prompt} Variation ${variantNum}.`,
          })),
        });
        const result = await waitForVideoJob(create.job_id);
        generated.push(result);
        if (variantCount > 1) {
          const variantProgress = Math.round((generated.length / variantCount) * 100);
          setProgressPercent(Math.max(variantProgress, 5));
          setProgressMessage(`Making the video scenes... ${generated.length}/${variantCount}`);
        }
      }

      setRender(generated[0] ?? null);
      setVariants(generated);

      if (generated[0]) {
        try {
          const posted = await ControlPlaneClient.postFactoryOutput(activeRunId, {
            stitchedVideoUri: generated[0].stitched_video_uri,
            metadataUri: generated[0].metadata_uri ?? undefined,
            targetPlatforms: planPayload.targetPlatforms,
            provenance: {
              ...(generated[0].provenance ?? {}),
              disclosure_text: generated[0].disclosure_text,
              synthetic: true,
              auto_triggered: true,
            },
          });
          setPublishResult(posted);
        } catch {
          // Keep generation successful even if autoposter enqueue fails.
        }
      }

      setProgressMessage("Your video is ready!");
      setProgressPercent(100);
      setSuccess(variantCount > 1 ? "📊 Variants are ready!" : "✅ Your video is ready!");
      setTimeout(() => setSuccess(null), 3500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : FRIENDLY_ERROR);
      setProgressMessage(FRIENDLY_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function playCurrentVideo() {
    if (!render?.stitched_video_uri) return;
    try {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
      } else {
        window.open(render.stitched_video_uri, "_blank", "noopener,noreferrer");
      }
    } catch {
      setError("Could not play the video. Please try again.");
    }
  }

  function startFresh() {
    setForm(DEFAULT_FORM);
    setReferenceImageUrl("");
    setReferencePreview(null);
    setPlan(null);
    setRender(null);
    setVariants([]);
    setError(null);
    setSuccess(null);
    setPublishResult(null);
    setProgressMessage("Ready when you are.");
    setProgressPercent(0);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold text-white">Phantom Studio UGC Factory</h1>
        <p className="text-base text-paradox-gray-300">
          Create a ready-to-post synthetic UGC video in just a few clicks.
        </p>
      </div>

      <Card className="space-y-6 p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Product name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-3 text-base text-white"
            />
            <p className="text-xs text-paradox-gray-400">What product are you showing?</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Influencer lock</span>
            <input
              value={form.influencer}
              onChange={(event) => setForm((prev) => ({ ...prev, influencer: event.target.value }))}
              className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-3 text-base text-white"
            />
            <p className="text-xs text-paradox-gray-400">Keep as `luna-v2` for the same face and body.</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Video engine</span>
            <select
              value={form.backend}
              onChange={(event) => setForm((prev) => ({ ...prev, backend: event.target.value }))}
              className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-3 text-base text-white"
            >
              <option value="kling">Kling</option>
              <option value="runway">Runway</option>
              <option value="cogvideox">CogVideoX</option>
            </select>
            <p className="text-xs text-paradox-gray-400">Choose the engine that makes your video.</p>
          </label>
        </div>

        <details className="rounded-xl border border-paradox-gray-800 bg-paradox-gray-900/40 p-4">
          <summary className="cursor-pointer text-sm font-medium text-white">📸 Add Photo (optional reference image)</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-paradox-gray-500">Reference URL</span>
              <input
                value={referenceImageUrl}
                onChange={(event) => setReferenceImageUrl(event.target.value)}
                placeholder="http://localhost:8002/media/references/luna-v2.png"
                className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-paradox-gray-500">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={uploadReferenceFile}
                className="w-full rounded-xl border border-paradox-gray-700 bg-paradox-gray-900 px-3 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-paradox-accent file:px-3 file:py-2 file:text-black"
              />
            </label>
          </div>
          {referencePreview ? (
            <img src={referencePreview} alt="reference" className="mt-4 h-28 rounded-lg object-cover" />
          ) : null}
        </details>

        <div className="space-y-3">
          <Button onClick={() => runFactoryFlow(1)} disabled={loading} className="w-full py-6 text-lg">
            🎥 Generate Arcads-style UGC
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => runFactoryFlow(10)} disabled={loading}>
              📊 Make 10 Versions
            </Button>
            <Button variant="outline" onClick={startFresh} disabled={loading}>
              ↺ Start Over
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-paradox-gray-300">{loading ? friendlyProgressMessage(progressMessage) : progressMessage}</p>
          <div className="h-3 overflow-hidden rounded-full bg-paradox-gray-800">
            <div
              className="h-full bg-paradox-accent transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        </div>

        {error ? <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p> : null}
      </Card>

      {plan ? (
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Scene preview</h2>
          {typeof plan.virality_score === "number" ? (
            <p className="text-sm text-paradox-gray-300">Estimated virality score: {plan.virality_score.toFixed(2)}/10</p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {plan.scenes.map((scene) => (
              <div key={scene.shot_id} className="rounded-xl border border-paradox-gray-800 bg-paradox-gray-900/50 p-4">
                <p className="text-sm font-semibold text-white">{scene.shot_id}</p>
                <p className="mb-2 text-xs text-paradox-gray-400">{scene.duration_seconds}s</p>
                <p className="text-sm text-paradox-gray-300">{scene.prompt}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {render ? (
        <Card className="space-y-5 p-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-2xl font-semibold text-emerald-200">✅ Your video is ready!</p>
            <p className="text-sm text-emerald-100">Play it, download it, or publish it now.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={playCurrentVideo} className="px-6 py-5 text-base">▶️ Play</Button>
            {render.stitched_video_uri?.startsWith("http") ? (
              <a
                href={render.stitched_video_uri}
                download
                className="inline-flex items-center justify-center rounded-2xl border border-paradox-accent px-6 py-5 text-base font-semibold text-paradox-accent hover:bg-paradox-accent/10"
              >
                ⬇️ Download
              </a>
            ) : null}
            <Button variant="outline" onClick={publishCurrentOutput} className="px-6 py-5 text-base">📤 Publish</Button>
          </div>

          <video
            key={render.stitched_video_uri}
            ref={videoRef}
            src={render.stitched_video_uri}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            onError={() => setError("Video preview could not load. Please try again or use Download.")}
            className="w-full rounded-xl border border-paradox-gray-800"
          />

          {publishResult ? (
            <p className="text-sm text-paradox-gray-300">
              Publish task: {publishResult.task_id} ({publishResult.provider} / {publishResult.status})
            </p>
          ) : null}

          <p className="text-sm text-paradox-gray-300">Disclosure: {render.disclosure_text || "This is AI-generated synthetic content."}</p>
        </Card>
      ) : null}

      {variants.length > 1 ? (
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold text-white">Variant previews</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {variants.map((variant, index) => (
              <div key={`${variant.video_uri}-${index}`} className="rounded-xl border border-paradox-gray-800 p-3">
                <p className="mb-2 text-sm font-semibold text-white">Variant {index + 1}</p>
                {variant.stitched_video_uri?.startsWith("http") ? (
                  <video src={variant.stitched_video_uri} muted loop controls className="w-full rounded-lg" />
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {success ? (
        <div className="fixed bottom-6 right-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}
    </div>
  );
}
