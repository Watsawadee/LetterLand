import { z } from "zod";
import {
    LoginRequestSchema,
    LoginResponseSchema,
    RegisterRequestSchema,
    RegisterResponseSchema,
} from "../../shared/schemas/auth.schema";
import { UserSchema } from "../../shared/schemas/user.schema";
import { ErrorResponseSchema, GetWordsOrErrorSchema, GetWordsResponseSchema, OxfordEntrySchema, SetupProfileRequestSchema, SetupProfileResponseSchema, SetupProfileSuccessSchema } from "../../shared/schemas/setup.schema"
export type User = z.infer<typeof UserSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;


//Profile Setup
export type OxfordEntry = z.infer<typeof OxfordEntrySchema>;
export type GetWordsResponse = z.infer<typeof GetWordsResponseSchema>;
export type SetupProfileRequest = z.infer<typeof SetupProfileRequestSchema>;
export type SetupProfileSuccess = z.infer<typeof SetupProfileSuccessSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SetupProfileResponse = z.infer<typeof SetupProfileResponseSchema>;
export type GetWordsOrError = z.infer<typeof GetWordsOrErrorSchema>;






