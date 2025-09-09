import { z } from "zod";

export const ProgressLevelupParamsSchema = z.object({
    userId: z.string().regex(/^\d+$/).transform(Number)
});

export const ProgressLevelupResponseSchema = z.object({
    message: z.string(),
    nextLevel: z.string().nullable(),
    canLevelUp: z.boolean(),
});