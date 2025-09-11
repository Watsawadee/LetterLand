import { z } from "zod";

export const EnglishLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
export type EnglishLevel = z.infer<typeof EnglishLevelSchema>;

export const vocabEntrySchema = z.object({
    headword: z.string(),
    CEFR: EnglishLevelSchema,
});

export const GetWordsResponseSchema = z.object({
    headwords: z.array(z.string()),
});

export const SetupProfileRequestSchema = z.object({
    userId: z.number(),
    age: z.number().int().min(1),
    selectedHeadwords: z.array(z.string()).min(1),
});

export const SetupProfileSuccessSchema = z.object({
    message: z.literal("Setup completed"),
    cefrLevel: EnglishLevelSchema,
    user: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string().email(),
        coin: z.number(),
        englishLevel: EnglishLevelSchema,
    }),
});

export const ErrorResponseSchema = z.object({
    error: z.string(),
});

export const SetupProfileResponseSchema = z.union([
    SetupProfileSuccessSchema,
    ErrorResponseSchema,
]);
export const GetWordsOrErrorSchema = z.union([
    GetWordsResponseSchema,
    ErrorResponseSchema,
]);