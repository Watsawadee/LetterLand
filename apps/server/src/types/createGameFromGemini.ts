import { EnglishLevel, GameType } from "@prisma/client";

// For material source
export type MaterialType = "text" | "link" | "pdf";

// Request body shape
export interface CreateGameFromGeminiRequest {
    userId: number;
    gameType: GameType;           // WORD_SEARCH | CROSSWORD_SEARCH
    difficulty: EnglishLevel;     // A1 | A2 | B1 | B2 | C1 | C2
    timer?: number | null;        // optional timer in seconds
    type: MaterialType;           // where the article comes from
    inputData?: string;           // required for text/link, not for pdf
}

// Response shape
export interface CreateGameFromGeminiResponse {
    message: string;
    game: {
        id: number;
        userId: number;
        gameTemplateId: number;
        timer?: number | null;
        isHintUsed: boolean;
        isFinished: boolean;
        gameTemplate: {
            id: number;
            gameTopic: string;
            gameType: GameType;
            difficulty: EnglishLevel;
            questions: {
                id: number;
                name: string;
                answer: string;
                hint: string;
            }[];
        };
    };
}
