import { describe, expect, it } from "vitest";

import { intakeSchema, IntakeFormValues } from "@/lib/intake/schema";

const baseValues: IntakeFormValues = {
  sourceType: "url",
  sourceUrl: "https://example.com/clip.mp4",
  uploadReference: "",
  projectName: "Original Creator",
  clipMode: "single_best",
  targetPlatforms: ["tiktok"],
  targetLanguages: ["en"],
  styleNotes: "High energy",
  syntheticEnabled: false,
  syntheticDisclosure: "",
  syntheticVoice: "",
};

describe("intake schema", () => {
  it("validates a proper intake", () => {
    expect(intakeSchema.parse(baseValues)).toEqual(baseValues);
  });

  it("requires a source URL when the type is url", () => {
    const invalid = { ...baseValues, sourceUrl: "", uploadReference: "" };
    expect(() => intakeSchema.parse(invalid)).toThrow("URL is required when source type is URL");
  });

  it("requires upload reference when upload is selected", () => {
    const invalid = {
      ...baseValues,
      sourceType: "upload",
      sourceUrl: "",
      uploadReference: "",
    };
    expect(() => intakeSchema.parse(invalid)).toThrow(
      "Upload reference is required when source type is upload",
    );
  });

  it("requires disclosure when synthetic workflow is enabled", () => {
    const invalid = {
      ...baseValues,
      syntheticEnabled: true,
      syntheticDisclosure: "",
    };
    expect(() => intakeSchema.parse(invalid)).toThrow(
      "Disclosure metadata is required for synthetic workflows",
    );
  });
});
