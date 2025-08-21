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
const baseUrl =
    // const baseUrl =
    // Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";
    // Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.101.118:8081";
    Platform.OS === "web"
        ? "http://localhost:3000"
        : Platform.OS === "android"
            ? "http://10.0.2.2:3000"
            : "http://192.168.101.118:3000";

const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

export const createGameFromGemini = async (
    payload: CreateGameFromGeminiRequest
) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");

    const res = await axiosInstance.post(
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
};