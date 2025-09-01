import { z } from "zod";
import { GameType, EnglishLevel } from "@prisma/client";

// Enums
export const GameTypeSchema = z.enum(GameType);
export const EnglishLevelSchema = z.enum(EnglishLevel);
export const MaterialTypeSchema = z.enum(["text", "link", "pdf"]);

export const CreateGameFromGeminiRequestSchema = z.object({
    userId: z.coerce.number(),
    gameType: GameTypeSchema,
    difficulty: EnglishLevelSchema,
    timer: z.coerce.number().nullable().optional(),
    type: MaterialTypeSchema,
    isPublic: z.coerce.boolean().optional(),
    inputData: z.string().optional(),
});

export const CreateGameFromGeminiResponseSchema = z.object({
    message: z.string(),
    game: z.object({
        id: z.number(),
        userId: z.number(),
        gameTemplateId: z.number(),
        isHintUsed: z.boolean(),
        isFinished: z.boolean(),
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
                })
            ),
        }),
        imagePrompt: z.string().optional(),
        image: z.any().optional(),
    }),
});