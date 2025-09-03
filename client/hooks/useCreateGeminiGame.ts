import { useMutation } from "@tanstack/react-query";
import { createGameFromGemini } from "@/services/gameCreationService";
import type { CreateGameFromGeminiRequest, CreateGameFromGeminiResponse } from "../libs/type";
import * as DocumentPicker from "expo-document-picker";

export function useCreateGameFromGemini() {
    return useMutation<
        CreateGameFromGeminiResponse["game"], // data returned on success
        Error,                                // error type
        {
            data: CreateGameFromGeminiRequest;
            file?: DocumentPicker.DocumentPickerAsset | null;
        }          // variables passed to mutationFn
    >({
        mutationFn: ({ data, file }) => createGameFromGemini(data, file),
        onSuccess: (game) => {
            alert(`Game created! Topic: ${game.gameTemplate.gameTopic}`);
        },
        onError: (error) => {
            alert("Failed to create game: " + (error?.message || error));
        },
    });
}
