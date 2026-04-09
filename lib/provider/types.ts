export type VoiceProvenanceRead = {
  provider_name: string;
  provider_model: string;
  request_metadata: Record<string, unknown> | null;
  response_metadata: Record<string, unknown> | null;
};

export type VoiceArtifactRead = {
  voice_id: number;
  request_id: number;
  audio_uri: string;
  duration_seconds: number;
  sample_rate: number;
  provider_name: string;
  provider_model: string;
  details: Record<string, unknown> | null;
  created_at: string;
  provenance: VoiceProvenanceRead;
};

export type LipSyncDisclosureRead = {
  disclosure_label: string;
  original_character_reference: string;
  consent_confirmed: boolean;
};

export type LipSyncArtifactRead = {
  lipsync_id: number;
  request_id: number;
  video_uri: string;
  duration_seconds: number;
  provider_name: string;
  provider_model: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  disclosure: LipSyncDisclosureRead;
};
