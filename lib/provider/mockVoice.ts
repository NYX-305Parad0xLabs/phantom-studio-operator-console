import type { LipSyncArtifactRead, VoiceArtifactRead } from "@/lib/provider/types";

export const mockVoiceArtifact: VoiceArtifactRead = {
  voice_id: 1,
  request_id: 101,
  audio_uri: "/mock/voice-track.mp3",
  duration_seconds: 12.8,
  sample_rate: 48000,
  provider_name: "flux-voice-stub",
  provider_model: "fluxo-synthetic-l1",
  details: {
    tone: "sincere",
    language: "en",
    style: "broadcast",
  },
  created_at: "2026-04-02T22:00:00Z",
  provenance: {
    provider_name: "flux-voice-stub",
    provider_model: "fluxo-synthetic-l1",
    request_metadata: {
      script: "Hypatia labs is now live",
      voice_profile: "protagonist-v1",
    },
    response_metadata: {
      duration_seconds: 12.8,
      channel_count: 2,
    },
  },
};

export const mockLipsyncArtifact: LipSyncArtifactRead = {
  lipsync_id: 201,
  request_id: 202,
  video_uri: "/mock/lipsync.mp4",
  duration_seconds: 13.2,
  provider_name: "hedra-lipsync-stub",
  provider_model: "hedra-speech-echo",
  metadata: {
    frame_rate: 30,
    resolution: "1080x1920",
  },
  created_at: "2026-04-02T22:30:00Z",
  disclosure: {
    disclosure_label: "original synthetic avatar",
    original_character_reference: "Nova-Prime",
    consent_confirmed: true,
  },
};
