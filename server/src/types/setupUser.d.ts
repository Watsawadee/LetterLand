import { EnglishLevel, User } from "@prisma/client";

export interface OxfordEntry {
  word: string;
  level: EnglishLevel;
}

export interface GetWordsResponse {
  words: string[];
}

export interface ErrorResponse {
  error: string;
}

export interface SetupProfileRequestBody {
  userId: number;
  age: number;
  selectedWords: string[];
}

export interface SetupProfileSuccess {
  message: "Setup completed";
  cefrLevel: EnglishLevel;
  user: User;
}

export type SetupProfileResponse = SetupProfileSuccess | ErrorResponse;
