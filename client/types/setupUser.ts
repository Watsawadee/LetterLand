
export interface GetWordsResponse {
    words: string[];
}

export interface SetupProfileRequestBody {
    userId: number;
    age: number;
    selectedWords: string[];
}

export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface User {
    id: number;
    username: string;
    email: string;
    coin: number;
    englishLevel: EnglishLevel;
}

export interface SetupProfileResponse {
    message: "Setup completed";
    cefrLevel: EnglishLevel;
    user: User;
}
