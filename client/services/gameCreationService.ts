import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "@/utils/auth";
import {
    CreateGameFromGeminiRequestSchema,
    CreateGameFromGeminiResponseSchema,
    MaterialTypeSchema,
    EnglishLevelSchema,
    GameTypeSchema,
} from "../types/createGame.schema";

import type {
    CreateGameFromGeminiRequest,
    CreateGameFromGeminiResponse,
    MaterialType,
    GameType,
    EnglishLevel,
} from "../libs/type";
import api from "./api";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';

// const baseUrl = "http://10.4.56.20:3000"
const baseUrl = "http://localhost:3000"
//     Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.101.118:8081";
// Platform.OS === "web"
//     ? "http://localhost:3000"
//     : Platform.OS === "android"
//         ? "http://10.0.2.2:3000"
//         : "http://192.168.101.118:3000";


export const createGameFromGemini = async (
    payload: CreateGameFromGeminiRequest, file?: DocumentPicker.DocumentPickerAsset | null
) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");

    if (payload.type === "pdf" && file) {
        const formData = new FormData();

        formData.append("file", {
            uri: file.uri,
            name: file.name || "uploaded.pdf",
            type: "application/pdf", // 🔥 hardcoded and correct
        } as any); // 👈 required for React Native

        formData.append("userId", String(payload.userId));
        formData.append("gameType", payload.gameType);
        formData.append("difficulty", payload.difficulty);
        if (payload.timer !== null && payload.timer !== undefined) {
            formData.append("timer", String(payload.timer));
        }
        if (payload.isPublic !== undefined) {
            formData.append("isPublic", String(payload.isPublic));
        }
        formData.append("type", "pdf");

        const res = await api.post("/geminis/gemini/pdf", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        const parsed = CreateGameFromGeminiResponseSchema.safeParse(res.data);
        if (!parsed.success) {
            console.error("Invalid Gemini response shape", parsed.error);
            throw new Error("Invalid response from server");
        }

        return res.data.game;
    }
    else {
        const res = await api.post(
            "/geminis/gemini",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const parsed = CreateGameFromGeminiResponseSchema.safeParse(res.data);
        if (!parsed.success) {
            console.error("Invalid Gemini response shape", parsed.error);
            throw new Error("Invalid response from server");
        }
        return res.data.game;
    }
};