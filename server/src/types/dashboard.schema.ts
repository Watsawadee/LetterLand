import { z } from "zod";
import { ErrorResponseSchema } from "./setup.schema";


export const PeriodEnum = z.enum(["week", "month", "year"]);
export const TotalPlaytimeResponseSchema = z.object({
    totalPlaytime: z.number(),
});

export const WordsLearnedResponseSchema = z.object({
    wordsLearned: z.number(),
});

export const GamesPlayedSinglePeriodSchema = z.object({
    labels: z.array(z.string()),
    counts: z.array(z.number()),
    range: z.object({
        start: z.string(),
        end: z.string(),
    }),
    period: PeriodEnum,
    date: z.string(),
});

export const GamesPlayedMultiplePeriodResponseSchema = z.object({
    results: z.array(GamesPlayedSinglePeriodSchema),
    currentIndex: z.number().optional(),
});
export const GamesPlayedMultiplePeriodOrErrorSchema = z.union([
    GamesPlayedMultiplePeriodResponseSchema,
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


export const AverageGamesByLevelPeerSinglePeriodSchema = z.object({
    englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
    userCount: z.number().int().nonnegative(),
    labels: z.array(z.string()),
    counts: z.array(z.number()),
    period: PeriodEnum,
    range: z.object({
        start: z.string(),
        end: z.string(),
    }),
    date: z.string(),
});

export const AverageGamesByLevelPeerMultiplePeriodResponseSchema = z.object({
    results: z.array(AverageGamesByLevelPeerSinglePeriodSchema),
    currentIndex: z.number().optional(),
});

export const AverageGamesByLevelPeerMultiplePeriodOrErrorSchema = z.union([
    AverageGamesByLevelPeerMultiplePeriodResponseSchema,
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

// User Progress (for donut chart)
export const UserProgressResponseSchema = z.object({
    englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
    progress: z.number().min(0).max(100),
    criteria: z.object({
        hasImprovedPerformance: z.boolean(),
        noHintsUsedRecently: z.boolean(),
        hasEnoughPlaytime: z.boolean(),
    }),
    summary: z.array(z.string()),
    donut: z.object({
        filled: z.number().min(0).max(100),
        remaining: z.number().min(0).max(100),
    }),
});

export const UserProgressOrErrorSchema = z.union([
    UserProgressResponseSchema,
    ErrorResponseSchema,
]);