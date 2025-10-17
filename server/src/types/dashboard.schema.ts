import { z } from "zod";
import { ErrorResponseSchema } from "./setup.schema";


export const PeriodEnum = z.enum(["week", "month", "year"]);
export const TotalPlaytimeResponseSchema = z.object({
    totalPlaytime: z.number(),
});

export const WordsLearnedResponseSchema = z.object({
    wordsLearned: z.number(),
});

export const GamesPlayedPerPeriodResponseSchema = z.object({
    labels: z.array(z.string()),
    counts: z.array(z.number()),
    range: z.object({
        start: z.string(),
        end: z.string(),
    }),
    period: PeriodEnum,
});
export const GamesPlayedPerPeriodOrErrorSchema = z.union([
    GamesPlayedPerPeriodResponseSchema,
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


export const AverageGamesByLevelPeerPeriodResponseSchema = z.object({
    englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
    userCount: z.number().int().nonnegative(),
    labels: z.array(z.string()),
    counts: z.array(z.number()),
    period: PeriodEnum,
    range: z.object({
        start: z.string(),
        end: z.string(),
    }),
});
export const AverageGamesByLevelPeerPeriodResponseSchemaOrErrorSchema = z.union([
    AverageGamesByLevelPeerPeriodResponseSchema,
    ErrorResponseSchema,
]);




export const GameStreakResponseSchema = z.object({
    allTime: z.number().int().nonnegative(),
    currentLevel: z.number().int().nonnegative(),
    highestStreakInThisLevel: z.number().int().nonnegative(),
});
export const GameStreakOrErrorSchema = z.union([
    GameStreakResponseSchema,
    ErrorResponseSchema,
]);
