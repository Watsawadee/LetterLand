export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface UserProfile {
    id: number;
    username: string;
    coin: number;
    englishLevel: EnglishLevel;
    email: string;
}
