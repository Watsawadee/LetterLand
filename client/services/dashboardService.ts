import { Platform } from "react-native";
import { WeeklyGameData } from "../types/weeklyGamePlayedProps"
import { getLoggedInUserId, getToken } from "@/utils/auth";
import axios from "axios";
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
        `/api/dashboard/user/${userId}/gameplayedperweek`,
        config
    );

    return res.data;
}

export async function getUserTotalPlaytime(): Promise<number> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();

    const res = await axiosInstance.get<{ totalPlaytime: number }>(
        `/api/dashboard/user/${userId}/playtime`,
        config
    );

    return res.data.totalPlaytime;
}

export async function getUserWordLearned(): Promise<number> {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();
    const res = await axiosInstance.get<{ wordsLearned: number }>(
        `/api/dashboard/user/${userId}/wordlearned`,
        config
    );
    return res.data.wordsLearned;
}