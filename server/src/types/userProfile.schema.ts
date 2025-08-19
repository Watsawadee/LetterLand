import { z } from "zod";
import { EnglishLevelSchema, ErrorResponseSchema } from "./setup.schema";

export const UserProfileResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    coin: z.number(),
    englishLevel: EnglishLevelSchema,
});


export const UserProfileOrErrorSchema = z.union([
    UserProfileResponseSchema,
    ErrorResponseSchema,
]);
