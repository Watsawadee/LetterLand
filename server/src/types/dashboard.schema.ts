import { z } from "zod";
import { ErrorResponseSchema } from "./setup.schema";

export const TotalPlaytimeResponseSchema = z.object({
    totalPlaytime: z.number(),
});

export const WordsLearnedResponseSchema = z.object({
    wordsLearned: z.number(),
});

export const GamesPlayedPerWeekResponseSchema = z.object({
    labels: z.array(z.string()),
    counts: z.array(z.number()),
    range: z.object({
        start: z.string(),
        end: z.string(),
    }),
    weekLabel: z.string(),
    offSet: z.number(),
});

export const AverageGamesByLevelResponseSchema = z.object({
    englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
    averages: z.array(
        z.object({
            date: z.string(),
            averageGamesPlayed: z.number(),
        })
    ),
    userCount: z.number(),
    range: z.object({
        start: z.date().or(z.string()),
        end: z.date().or(z.string()),
    }),
    offSet: z.number(),
});
export const AverageGamesByLevelOrErrorSchema = z.union([
    AverageGamesByLevelResponseSchema,
    ErrorResponseSchema,
]);


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

