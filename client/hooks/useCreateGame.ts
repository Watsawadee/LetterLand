import { useMutation } from "@tanstack/react-query";
import { createGeminiGame } from "@/services/gameCreationService";
import type { CreateGeminiGameRequest, GeminiGameResponse } from "@/types/geminiGame";

export function useCreateGame() {
    return useMutation({
        mutationFn: (data: CreateGeminiGameRequest) => createGeminiGame(data),
        onSuccess: (data) => {
            alert("Game created! Topic: " + data.topic);
        },
        onError: (error) => {
            alert("Failed to create game: " + (error?.message || error));
        },
    }

    )
}