import { EnglishLevel } from "@prisma/client";

export interface UserProfileResponse {
    id: number;
    username: string;
    email: string;
    coin: number;
    englishLevel: EnglishLevel;
}
