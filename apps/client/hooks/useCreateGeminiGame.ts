import { useMutation } from "@tanstack/react-query";
import { createGameFromGemini } from "@/services/gameCreationService";
import type { CreateGameFromGeminiRequest, CreateGameFromGeminiResponse } from "@/types/createGameFromGemini";

export function useCreateGameFromGemini() {
    return useMutation<
        CreateGameFromGeminiResponse["game"], // data returned on success
        Error,                                // error type
        CreateGameFromGeminiRequest           // variables passed to mutationFn
    >({
        mutationFn: (data: CreateGameFromGeminiRequest) => createGameFromGemini(data),
        onSuccess: (game) => {
            alert(`Game created! Topic: ${game.gameTemplate.gameTopic}`);
        },
        onError: (error) => {
            alert("Failed to create game: " + (error?.message || error));
        },
    });
}
