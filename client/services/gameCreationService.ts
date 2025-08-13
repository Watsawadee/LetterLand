import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "@/utils/auth";
import { CreateGameFromGeminiRequest, CreateGameFromGeminiResponse } from "@/types/createGameFromGemini";
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
): Promise<CreateGameFromGeminiResponse["game"]> => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");

    const res = await axiosInstance.post<CreateGameFromGeminiResponse>(
        "/api/geminis/gemini",
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data.game;
};