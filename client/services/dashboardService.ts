import { Platform } from "react-native";
import { WeeklyGameData } from "../types/weeklyGamePlayedProps"
import { getLoggedInUserId, getToken } from "@/utils/auth";
import axios from "axios";
import api from "./api";
import { GamesPlayedPerWeekOrError, TotalPlaytimeOrError, WordsLearnedOrError } from "@/libs/type";
import { GamesPlayedPerWeekOrErrorSchema, GamesPlayedPerWeekResponseSchema, TotalPlaytimeOrErrorSchema, WordsLearnedOrErrorSchema } from "../types/dashboard.schema";
import { ErrorResponseSchema } from "../types/setup.schema";

async function getAuthHeader() {
    const token = await getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}
export async function getTotalGameThisWeek(offSet = 0): Promise<WeeklyGameData> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();
    const res = await api.get<WeeklyGameData>(
        `/dashboard/user/${userId}/gameplayedperweek?offset=${offSet}`,
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