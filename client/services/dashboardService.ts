import { Platform } from "react-native";
import { GamesPlayedPerPeriod } from "../types/gamesPlayedPerPeriod"
import { getLoggedInUserId, getToken } from "@/utils/auth";
import axios from "axios";
import api from "./api";
import { AverageGamesByLevelPeerOrError, GameStreakOrError, TotalPlaytimeOrError, WordsLearnedOrError } from "@/libs/type";
import { AverageGamesByLevelPeerPeriodResponseSchema, GamesPlayedPerPeriodResponseSchema, GameStreakOrErrorSchema, TotalPlaytimeOrErrorSchema, UserProgressResponseSchema, WordsLearnedOrErrorSchema } from "../types/dashboard.schema";
import { ErrorResponseSchema } from "../types/setup.schema";

export async function getAuthHeader() {
    const token = await getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}
export async function getTotalGamePerPeriod(period: "week" | "month" | "year" = "week",
    date?: string,
    offSet = 0): Promise<GamesPlayedPerPeriod> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();
    const params: Record<string, string | number> = { period, offset: offSet };
    if (date) params.date = date;

    const res = await api.get<GamesPlayedPerPeriod>(
        `/dashboard/user/${userId}/gameplayedperperiod`, { ...config, params }
    );
    const ok = GamesPlayedPerPeriodResponseSchema.safeParse(res.data);
    if (ok.success) return ok.data;

    const err = ErrorResponseSchema.safeParse(res.data);
    if (err.success) throw new Error(err.data.error);

    throw new Error("Invalid response from server");
}
// export const getAverageGamesByLevel = async (offSet = 0) => {
//     const token = await getToken();
//     if (!token) throw new Error("No token");

//     const res = await api.get(`/dashboard/user/averagebylevel`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { offSet }, // ✅ match backend param name
//     });

//     const parsed = AverageGamesByLevelResponseSchema.safeParse(res.data);
//     if (!parsed.success) {
//         console.error("❌ Invalid response shape", parsed.error);
//         throw new Error("Invalid response from server");
//     }

//     return parsed.data;
// };



export async function getUserTotalPlaytime(): Promise<TotalPlaytimeOrError> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();

    const res = await api.get<{ totalPlaytime: number }>(
        `/dashboard/user/${userId}/playtime`,
        config
    );

    return TotalPlaytimeOrErrorSchema.parse(res.data);
}

export async function getUserWordLearned(): Promise<WordsLearnedOrError> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();
    const res = await api.get<{ wordsLearned: number }>(
        `/dashboard/user/${userId}/wordlearned`,
        config
    );
    return WordsLearnedOrErrorSchema.parse(res.data);
}

export const getPeerAverageGamesPerPeriod = async (
    period: "week" | "month" | "year" = "week",
    date?: string
): Promise<AverageGamesByLevelPeerOrError> => {
    const token = await getToken();
    if (!token) throw new Error("No token");

    const params: Record<string, string> = { period };
    if (date) params.date = date;

    const res = await api.get(`/dashboard/average/eachperiod`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

    const parsed = AverageGamesByLevelPeerPeriodResponseSchema.safeParse(res.data);
    if (parsed.success) return parsed.data;

    const err = ErrorResponseSchema.safeParse(res.data);
    if (err.success) throw new Error(err.data.error);

    throw new Error("Invalid response from server");
};



//Streaks
export const getUserGameStreak = async (): Promise<GameStreakOrError> => {
    const config = await getAuthHeader();
    const res = await api.get(`/dashboard/user/gameplayedstreak`, config);

    const parsed = GameStreakOrErrorSchema.safeParse(res.data);
    if (parsed.success) return parsed.data;

    const err = ErrorResponseSchema.safeParse(res.data);
    if (err.success) throw new Error(err.data.error);

    throw new Error("Invalid response from server");
};


//Get user progress
export async function getUserProgress() {
    const userId = await getLoggedInUserId();
    const token = await getToken();
    if (!token) throw new Error("No token");

    const res = await api.get(`/dashboard/user/gameprogress`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const parsed = UserProgressResponseSchema.safeParse(res.data);
    if (!parsed.success) throw new Error("Invalid response from server");
    return parsed.data;
}
