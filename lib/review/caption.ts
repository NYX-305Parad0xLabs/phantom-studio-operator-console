export type CaptionCue = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  emphasisWords: string[];
  emojiSuggestions: string[];
};

export type CaptionStylePreset = {
  id: string;
  name: string;
  description: string;
  paletteHint: string;
  accentName: string;
};

export type CaptionArtifact = {
  id: string;
  overlayHint: string;
  stylePreset: CaptionStylePreset;
  cues: CaptionCue[];
};

export type CaptionTranslation = {
  id: string;
  language: string;
  displayName: string;
  cues: {
    cueId: string;
    text: string;
  }[];
  qualityNotes: string;
};

export const captionStylePresets: CaptionStylePreset[] = [
  {
    id: "sendshort-bold",
    name: "SendShort Bold",
    description: "High-contrast neon capsule with punchy uppercase text.",
    paletteHint: "electric green on charcoal",
    accentName: "radiant",
  },
  {
    id: "studio-slate",
    name: "Studio Slate",
    description: "Subtle serif with soft shadows for cinematic documentaries.",
    paletteHint: "warm amber on slate",
    accentName: "amber",
  },
];

export const mockCaptionArtifact: CaptionArtifact = {
  id: "caption-001",
  overlayHint: "Center bottom, bold block with micro shadow",
  stylePreset: captionStylePresets[0],
  cues: [
    {
      id: "cue-001",
      startSeconds: 0.2,
      endSeconds: 2.5,
      text: "We just landed the biggest deal of our lives.",
      emphasisWords: ["biggest", "deal"],
      emojiSuggestions: ["🔥", "🚀"],
    },
    {
      id: "cue-002",
      startSeconds: 2.6,
      endSeconds: 4.3,
      text: "Every creator deserves a stage this electric.",
      emphasisWords: ["creator", "electric"],
      emojiSuggestions: ["⚡", "🎤"],
    },
    {
      id: "cue-003",
      startSeconds: 4.4,
      endSeconds: 6.7,
      text: "Stay bold, disclose synthetic frames, and own your story.",
      emphasisWords: ["bold", "own"],
      emojiSuggestions: ["🎯", "🛡️"],
    },
  ],
};

export const mockCaptionTranslations: CaptionTranslation[] = [
  {
    id: "es",
    language: "es-ES",
    displayName: "Spanish",
    qualityNotes: "Sentence structures shortened for scrolling attention.",
    cues: [
      {
        cueId: "cue-001",
        text: "Acabamos de cerrar el trato más grande de nuestras vidas.",
      },
      {
        cueId: "cue-002",
        text: "Cada creador merece un escenario así de eléctrico.",
      },
      {
        cueId: "cue-003",
        text: "Mantente audaz, revela que es sintético y hazlo tuyo.",
      },
    ],
  },
  {
    id: "fr",
    language: "fr-FR",
    displayName: "French",
    qualityNotes: "Tone stays bold; some adjectives simplified.",
    cues: [
      {
        cueId: "cue-001",
        text: "Nous venons de conclure le plus gros deal de notre vie.",
      },
      {
        cueId: "cue-002",
        text: "Chaque créateur mérite une scène aussi électrique.",
      },
      {
        cueId: "cue-003",
        text: "Reste audacieux, dis que c'est synthétique, et prends le contrôle.",
      },
    ],
  },
];
