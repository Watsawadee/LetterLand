import { Platform } from "react-native";
import { WeeklyGameData } from "../types/weeklyGamePlayedProps"
import { getLoggedInUserId, getToken } from "@/utils/auth";
import axios from "axios";
import { GamesPlayedPerWeekOrError, TotalPlaytimeOrError, WordsLearnedOrError } from "@/libs/type";
import { GamesPlayedPerWeekOrErrorSchema, GamesPlayedPerWeekResponseSchema, TotalPlaytimeOrErrorSchema, WordsLearnedOrErrorSchema } from "../types/dashboard.schema";
import { ErrorResponseSchema } from "../types/setup.schema";
const baseUrl =
    Platform.OS === "android"
        ? "http://10.0.2.2:3000"
        : "http://localhost:3000";

const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

async function getAuthHeader() {
    const token = await getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}
export async function getTotalGameThisWeek(): Promise<WeeklyGameData> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();
    const res = await axiosInstance.get<WeeklyGameData>(
        `/dashboard/user/${userId}/gameplayedperweek`,
        config
    );
    const ok = GamesPlayedPerWeekResponseSchema.safeParse(res.data);
    if (ok.success) return ok.data;

    const err = ErrorResponseSchema.safeParse(res.data);
    if (err.success) throw new Error(err.data.error);

    throw new Error("Invalid response from server");
}

export async function getUserTotalPlaytime(): Promise<TotalPlaytimeOrError> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();

    const res = await axiosInstance.get<{ totalPlaytime: number }>(
        `/dashboard/user/${userId}/playtime`,
        config
    );

    return TotalPlaytimeOrErrorSchema.parse(res.data);
}

export async function getUserWordLearned(): Promise<WordsLearnedOrError> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();
    const res = await axiosInstance.get<{ wordsLearned: number }>(
        `/dashboard/user/${userId}/wordlearned`,
        config
    );
    return WordsLearnedOrErrorSchema.parse(res.data);
}