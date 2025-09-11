import z from "zod";
import {
    LoginRequestSchema,
    LoginResponseSchema,
    RegisterRequestSchema,
    RegisterResponseSchema,
} from "./auth.schema";
import { ErrorResponseSchema, GetWordsOrErrorSchema, GetWordsResponseSchema, SetupProfileRequestSchema, SetupProfileResponseSchema, SetupProfileSuccessSchema, vocabEntrySchema } from "./setup.schema";
import { UserProfileOrErrorSchema, UserProfileResponseSchema } from "./userProfile.schema";
import { GamesPlayedPerWeekOrErrorSchema, TotalPlaytimeOrErrorSchema, WordsLearnedOrErrorSchema } from "./dashboard.schema";
import { CreateGameFromGeminiRequestSchema, CreateGameFromGeminiResponseSchema, EnglishLevelSchema, GameTypeSchema, MaterialTypeSchema } from "./createGame.schema";
import { UpdateUserProfileResponse, UpdateUserSettingSchema } from "./setting.schema";
import { ProgressLevelupParamsSchema, ProgressLevelupResponseSchema } from "./progressLevelup.schema";
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;


//Profile Setup
export type vocabEntry = z.infer<typeof vocabEntrySchema>;
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


//Create Game
export type MaterialType = z.infer<typeof MaterialTypeSchema>;
export type GameType = z.infer<typeof GameTypeSchema>;
export type EnglishLevel = z.infer<typeof EnglishLevelSchema>;

export type CreateGameFromGeminiRequest = z.infer<typeof CreateGameFromGeminiRequestSchema>;
export type CreateGameFromGeminiResponse = z.infer<typeof CreateGameFromGeminiResponseSchema>;


//User Setting
export type UpdateUserProfileInput = z.infer<typeof UpdateUserSettingSchema>;
export type UpdateUserProfileResponse = z.infer<typeof UpdateUserProfileResponse>


//Progress Levelup
export type ProgressLevelupParams = z.infer<typeof ProgressLevelupParamsSchema>;
export type ProgressLevelupResponse = z.infer<typeof ProgressLevelupResponseSchema>;