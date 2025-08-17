import z from "zod";
import {
    LoginRequestSchema,
    LoginResponseSchema,
    RegisterRequestSchema,
    RegisterResponseSchema,
} from "@letterland/shared";
import { ErrorResponseSchema, GetWordsOrErrorSchema, GetWordsResponseSchema, OxfordEntrySchema, SetupProfileRequestSchema, SetupProfileResponseSchema, SetupProfileSuccessSchema } from "@letterland/shared";
import { UserProfileOrErrorSchema, UserProfileResponseSchema } from "@letterland/shared";
import { GamesPlayedPerWeekOrErrorSchema, TotalPlaytimeOrErrorSchema, WordsLearnedOrErrorSchema } from "@letterland/shared";
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

//Get User Profile
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UserProfileOrError = z.infer<typeof UserProfileOrErrorSchema>;

//User Dashboard
export type TotalPlaytimeOrError = z.infer<typeof TotalPlaytimeOrErrorSchema>;
export type WordsLearnedOrError = z.infer<typeof WordsLearnedOrErrorSchema>;
export type GamesPlayedPerWeekOrError = z.infer<
    typeof GamesPlayedPerWeekOrErrorSchema
>;
