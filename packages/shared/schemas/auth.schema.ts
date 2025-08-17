import { z } from "zod";
import { UserSchema } from "./user.schema";
export const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const LoginResponseSchema = z.object({
    message: z.string(),
    token: z.string(),
    user: UserSchema,
});
export const RegisterRequestSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export const RegisterResponseSchema = z.object({
    message: z.string(),
    token: z.string(),
    user: UserSchema,
});