import { z } from "zod";
import { ErrorResponseSchema } from "./setup.schema";

export const TotalPlaytimeResponseSchema = z.object({
    totalPlaytime: z.number(),
});

export const WordsLearnedResponseSchema = z.object({
    wordsLearned: z.number(),
});

export const GamesPlayedPerWeekResponseSchema = z.object({
    labels: z.array(z.string()),  // ["Su", "Mo", ...]
    counts: z.array(z.number()),  // [2, 0, 1, ...]
});

export const TotalPlaytimeOrErrorSchema = z.union([
    TotalPlaytimeResponseSchema,
    ErrorResponseSchema,
]);

export const WordsLearnedOrErrorSchema = z.union([
    WordsLearnedResponseSchema,
    ErrorResponseSchema,
]);

export const GamesPlayedPerWeekOrErrorSchema = z.union([
    GamesPlayedPerWeekResponseSchema,
    ErrorResponseSchema,
]);

