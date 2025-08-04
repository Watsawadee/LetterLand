import { Platform } from "react-native";
import { WeeklyGameData } from "../types/weeklyGamePlayedProps"
import { getLoggedInUserId, getToken } from "@/utils/auth";
const baseUrl =
    Platform.OS === "android"
        ? "http://10.0.2.2:3000"
        : "http://localhost:3000";
export async function getTotalGameThisWeek(): Promise<WeeklyGameData> {
    const userId = await getLoggedInUserId();
    const jwtToken = await getToken();
    const res = await fetch(`${baseUrl}/api/dashboard/user/${userId}/gameplayedperweek`, {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    })
    if (!res.ok) {
        throw new Error("Failed to fetch weekly games")
    }
    return await res.json();
}

export async function getUserTotalPlaytime(): Promise<number> {
    const userId = await getLoggedInUserId();
    const jwtToken = await getToken();
    const res = await fetch(`http://localhost:3000/api/dashboard/user/${userId}/playtime`, {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });
    if (!res.ok) throw new Error("Failed to fetch total playtime");
    const data = await res.json();
    return data.totalPlaytime;
}

export async function getUserWordLearned(): Promise<number> {
    const userId = await getLoggedInUserId();
    const jwtToken = await getToken();
    const res = await fetch(`http://localhost:3000/api/dashboard/user/${userId}/wordlearned`, {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch words learned")
    }
    const data = await res.json();
    return data.wordsLearned;
}