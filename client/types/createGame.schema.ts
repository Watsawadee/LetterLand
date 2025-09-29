import { z } from "zod";

// Enums
export const GameTypeSchema = z.enum(["WORD_SEARCH", "CROSSWORD_SEARCH"]);
export const EnglishLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
export const MaterialTypeSchema = z.enum(["text", "link", "pdf"]);

export const CreateGameFromGeminiRequestSchema = z.object({
    userId: z.number(),
    gameType: GameTypeSchema,
    difficulty: EnglishLevelSchema,
    timer: z.number().nullable().optional(),
    type: MaterialTypeSchema,
    isPublic: z.boolean().optional(),
    inputData: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type !== "pdf" && !data.inputData) {
        ctx.addIssue({
            path: ["inputData"],
            code: "custom",
            message: `Input is required for type "${data.type}"`,
        });
    }
});

export const CreateGameFromGeminiResponseSchema = z.object({
    message: z.string(),
    game: z.object({
        id: z.number(),
        userId: z.number(),
        gameTemplateId: z.number(),
        timer: z.number().nullable().optional(),
        isHintUsed: z.boolean(),
        isFinished: z.boolean(),
        gameCode: z.string().nullable(),
        gameTemplate: z.object({
            id: z.number(),
            gameTopic: z.string(),
            gameType: GameTypeSchema,
            difficulty: EnglishLevelSchema,
            imageUrl: z.string().nullable().optional(),
            questions: z.array(
                z.object({
                    id: z.number(),
                    name: z.string(),
                    answer: z.string(),
                    hint: z.string(),
                    pronunciationUrl: z.string().optional(),

                })
            ),
        }),
        imagePrompt: z.string().optional(),
        image: z.any().optional(),
    }),
});