import { z } from "zod";

export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    username: z.string(),
    age: z.number(),
    hasCompletedSetup: z.boolean(),
    englishLevel: z.string().optional(),
    coin: z.number().optional(),
    hint: z.number().optional(),
    created_at: z.string().optional(),
    total_playtime: z.number().optional(),
    nextLevel: z.string().nullable().optional(),
    canLevelUp: z.boolean().optional(),
});
