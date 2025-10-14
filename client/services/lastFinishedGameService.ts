import { getLoggedInUserId } from "@/utils/auth";
import { getAuthHeader } from "./dashboardService";
import api from "./api";

export async function getUserLastFinishedGame() {
    const userId = await getLoggedInUserId();
    const config = await getAuthHeader();

    const res = await api.get(`/users/user/lastfinishedgame`, config);

    // Optionally validate shape
    if ("lastFinishedGame" in res.data) {
        return res.data.lastFinishedGame;
    }

    // handle case where user has no finished game
    if (res.data.message) {
        return { message: res.data.message };
    }

    throw new Error("Invalid response from server");
}