// services/achievementService.ts
import api from "./api";
import { AxiosResponse } from "axios";
import { getToken } from "@/utils/auth";
import { Achievement, AchievementResponse } from "@/types/achievementTypes";

// Build GDrive-proxied image URL that your backend serves
export const buildAchievementImageUrl = (fileName: string) =>
  `${api.defaults.baseURL?.replace(/\/$/, "")}/achievement/achievementimage/${encodeURIComponent(
    fileName
  )}`;

/** Ask server to recompute completion flags before reading */
export async function syncAchievementProgress(): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");
  await api.post("/achievement/check", undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Fetch ALL achievements + map image URLs */
export async function fetchUserAchievements(): Promise<Achievement[]> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const res: AxiosResponse<AchievementResponse> = await api.get("/achievement", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.data.map((a) => ({
    ...a,
    // backend sends just the filename; make it a full URL
    imageUrl: a.imageUrl ? buildAchievementImageUrl(a.imageUrl) : null,
    // some older rows may not have isClaimed in response -> normalize
    isClaimed: a.isClaimed ?? false,
  }));
}

/** Client-side selector: show exactly 3 cards.
 * 1) show any CLAIMABLE first (completed && not claimed)
 * 2) then fill with INCOMPLETE, both ordered by rank asc (fallback by id)
 */
export function selectActiveTop3(all: Achievement[]): Achievement[] {
  const byRank = (x: Achievement, y: Achievement) =>
    (x.rank ?? 9_999) - (y.rank ?? 9_999) || x.id - y.id;

  const claimable = all.filter(a => a.isCompleted && !a.isClaimed).sort(byRank);
  const incomplete = all.filter(a => !a.isCompleted).sort(byRank);

  const picks: Achievement[] = [];
  for (const a of claimable) {
    if (picks.length < 3) picks.push(a);
  }
  for (const a of incomplete) {
    if (picks.length < 3) picks.push(a);
  }
  return picks;
}

export async function claimAchievementAPI(
  achievementId: number
): Promise<{ coinReward: number; newCoinBalance: number }> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const res = await api.post(`/achievement/${achievementId}/claim`, undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data as { coinReward: number; newCoinBalance: number };
}

export async function fetchUserCoins(): Promise<number> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const res = await api.get("/achievement/coins", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return (res.data?.data?.coins ?? 0) as number;
}
