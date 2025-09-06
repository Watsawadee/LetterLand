import api from "./api";
import { AxiosResponse } from "axios";
import { getToken } from "@/utils/auth";
import { Achievement, AchievementResponse } from "@/types/achievementTypes";

// Build GDrive-proxied image URL
export const buildAchievementImageUrl = (fileName: string) =>
  `${api.defaults.baseURL?.replace(/\/$/, "")}/achievement/achievementimage/${encodeURIComponent(fileName)}`;

/** Sync server-side UA rows so isCompleted is correct before we read */
export async function syncAchievementProgress(): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");
  await api.post("/achievement/check", undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchUserAchievements(): Promise<Achievement[]> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const res: AxiosResponse<AchievementResponse> = await api.get("/achievement", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.data.map((a) => ({
    ...a,
    imageUrl: a.imageUrl ? buildAchievementImageUrl(a.imageUrl) : null,
  }));
}

export async function claimAchievementAPI(
  achievementId: number
): Promise<{ coinReward: number }> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const res: AxiosResponse<{
    message: string;
    data: { achievementId: number; coinReward: number };
  }> = await api.post(`/achievement/${achievementId}/claim`, undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.data;
}
