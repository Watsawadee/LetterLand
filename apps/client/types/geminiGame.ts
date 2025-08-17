// src/types/geminiGame.ts

export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type MaterialType = "text" | "link" | "pdf";

export interface CreateGeminiGameRequest {
    userId: number | string;
    userCEFR: EnglishLevel;
    inputData: string;
    type: MaterialType;
}

// Example response type for /gemini endpoint
export interface GeminiGameQuestion {
    question: string;
    answer: string;
    hint?: string;
}

export interface GeminiGameResponse {
    success: boolean;
    game: {
        id: number;
        topic: string;
        questions: GeminiGameQuestion[];
        userId: number;
        imagePrompt?: string;
    }
}
