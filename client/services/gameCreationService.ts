import axios from "axios";
import type { CreateGeminiGameRequest, GeminiGameResponse } from "../types/geminiGame";
export const createGeminiGame = async ({ userId, userCEFR, inputData, type }: CreateGeminiGameRequest): Promise<GeminiGameResponse['game']> => {
    const res = await axios.post<GeminiGameResponse>(
        "http://localhost:3000/api/geminis/gemini",
        {
            userId,
            userCEFR,
            inputData,
            type,
        }
    )
    return res.data.game
}