import { RenderLayerRead, RenderOutputRead, RenderPlanRead, RenderSummaryRead } from "@/lib/api/providerGateway";

const baseTimestamp = new Date().toISOString();

export const mockPlatformSpec = {
  id: 1,
  name: "TikTok / Reels portrait (9:16)",
  target_platform: "tiktok",
  orientation: "portrait",
  resolution: "1080x1920",
  aspect_ratio: "9:16",
  metadata_json: { captionFormats: ["SRT", "JSON"] },
  created_at: baseTimestamp,
};

export const mockRenderPlan: RenderPlanRead = {
  id: 1,
  clip_id: 101,
  caption_plan_id: 77,
  translation_ids: [201, 202],
  voice_artifact_id: 501,
  lipsync_result_id: 601,
  metadata_json: { style: "sendshort_like" },
  created_at: baseTimestamp,
};

export const mockRenderLayers: RenderLayerRead[] = [
  {
    layer_type: "clip_trim",
    metadata_json: { note: "Trimmed hero clip" },
    created_at: baseTimestamp,
  },
  {
    layer_type: "caption_overlay",
    metadata_json: { style_preset: "sendshort_like" },
    created_at: baseTimestamp,
  },
  {
    layer_type: "voice_track",
    metadata_json: { profile: "Flux narrator" },
    created_at: baseTimestamp,
  },
  {
    layer_type: "export_render",
    metadata_json: { codec: "h264/mp4", frame_rate: 24 },
    created_at: baseTimestamp,
  },
];

export const mockRenderOutput: RenderOutputRead = {
  id: 1,
  render_plan_id: mockRenderPlan.id,
  video_uri: "/mock/render.mp4",
  caption_text_path: "/mock/render.captions.srt",
  caption_json_path: "/mock/render.captions.json",
  duration_seconds: 14.8,
  spec_id: mockPlatformSpec.id,
  metadata_json: { resolution: mockPlatformSpec.resolution },
  created_at: baseTimestamp,
  spec: mockPlatformSpec,
};

export const mockPublishReadyPayload = {
  id: 1,
  render_output_id: mockRenderOutput.id,
  title: "Phase One: Bold Synthetic Reveal",
  caption: "Biggest deal energy, synthetic creator disclosure, viral CTA.",
  hashtags: ["#phaseshort", "#originalsynthetic", "#viralsafe"],
  rationale:
    "Hooked viewers within 3 seconds, bold disclosure callout, layered captions for retention.",
  spec_id: mockPlatformSpec.id,
  metadata_json: { caption_count: 3 },
  created_at: baseTimestamp,
};

export const mockRenderSummary: RenderSummaryRead = {
  plan: mockRenderPlan,
  layers: mockRenderLayers,
  output: mockRenderOutput,
  spec: mockPlatformSpec,
  publish_ready: mockPublishReadyPayload,
};
