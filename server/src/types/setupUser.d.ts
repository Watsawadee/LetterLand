// setupUser.ts
import { EnglishLevel } from "@prisma/client";

export type SetupProfileResponse = {
  message: string;
  cefrLevel: EnglishLevel;
  user: {
    id: number;
    age: number;
    englishLevel: EnglishLevel;
  };
};
