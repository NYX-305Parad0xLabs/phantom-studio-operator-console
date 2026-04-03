import { z } from "zod";

export const platformOptions = ["tiktok", "instagram", "x"] as const;
export const languageOptions = ["en", "es", "fr", "pt", "de"] as const;

export const intakeSchema = z
  .object({
    sourceType: z.enum(["url", "upload"]),
    sourceUrl: z.string().url().optional(),
    uploadReference: z.string().max(200).optional(),
    projectName: z.string().min(2),
    clipMode: z.enum(["single_best", "series_max_3"]),
    targetPlatforms: z.array(z.enum(platformOptions)).min(1),
    targetLanguages: z.array(z.enum(languageOptions)).min(1),
    styleNotes: z.string().max(400).optional(),
    syntheticEnabled: z.boolean(),
    syntheticDisclosure: z.string().max(200).optional(),
    syntheticVoice: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "url" && !data.sourceUrl) {
      ctx.addIssue({
        path: ["sourceUrl"],
        code: z.ZodIssueCode.custom,
        message: "URL is required when source type is URL",
      });
    }
    if (data.sourceType === "upload" && !data.uploadReference) {
      ctx.addIssue({
        path: ["uploadReference"],
        code: z.ZodIssueCode.custom,
        message: "Upload reference is required when source type is upload",
      });
    }
    if (data.syntheticEnabled && !data.syntheticDisclosure) {
      ctx.addIssue({
        path: ["syntheticDisclosure"],
        code: z.ZodIssueCode.custom,
        message: "Disclosure metadata is required for synthetic workflows",
      });
    }
  });

export type IntakeFormValues = z.infer<typeof intakeSchema>;
