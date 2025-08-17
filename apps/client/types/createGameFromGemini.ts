import { EnglishLevel } from "./geminiGame";

// matches your Prisma GameType enum
export type GameTypeEnum = "WORD_SEARCH" | "CROSSWORD_SEARCH";

// request type for merged endpoint
export interface CreateGameFromGeminiRequest {
    userId: number;
    gameType: GameTypeEnum;
    userCEFR: EnglishLevel;       // from your existing type
    timer?: number | null;          // frontend only, optional
    type: "text" | "link" | "pdf";  // material source
    inputData?: string;             // required for text/link, not for pdf
}

// response type
export interface CreateGameFromGeminiResponse {
    message: string;
    game: {
        id: number;
        userId: number;
        gameTemplateId: number;
        isHintUsed: boolean;
        isFinished: boolean;
        gameTemplate: {
            id: number;
            gameTopic: string;
            gameType: GameTypeEnum;
            difficulty: EnglishLevel;
            questions: {
                id: number;
                name: string;
                answer: string;
                hint?: string;
            }[];
        };
    };
}
