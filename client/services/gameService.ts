import { Platform } from "react-native";
import api from "./api";
import { getLoggedInUserId } from "@/utils/auth";
import { QuestionAnswer, UserData } from "@/types/type";

export const getGameData = async (gameId: string | number) => {
  const response = await api.get(`/games/${gameId}`);
  return response.data.data.game;
};

export const getUserData = async (userId: number) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
};

export const getBGImage = async (imgName: string) => {
  try {
    if (Platform.OS === "web") {
      // Browser → use blob
      const response = await api.get(`/images/image/${imgName}.png`, {
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } else {
      // Mobile → return direct URI
      return `${api.defaults.baseURL}/images/image/${imgName}.png`;
    }
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw error;
  }
};

type UseHintResult = {
  remainingHints: number;
  alreadyUsedBefore: boolean;
};

export const useHint = async (
  userId: number,
  gameId?: number | string
): Promise<UseHintResult> => {
  const r = await api.post(`/users/${userId}/useHint`, { gameId });
  const remainingHints = Number(r?.data?.data?.remainingHints ?? 0);
  const alreadyUsedBefore = Boolean(r?.data?.data?.alreadyUsedBefore);

  if (gameId != null && !alreadyUsedBefore) {
    try {
      await completeGame({ gameId, hintUsed: true });
    } catch (e) {
      console.warn("Failed to mark isHintUsed on game:", e);
    }
  }
  return { remainingHints, alreadyUsedBefore };
};

export const purchaseHints = async (
  userId: number,
  qty: 1 | 3 | 5
): Promise<UserData> => {
  const res = await api.post(`/users/${userId}/buyhint`, { qty });
  return res.data.data as UserData;
};

export async function deleteIncompleteGame(gameId: number, userId: number) {
  await api.delete(`/games/${gameId}/delete`, { data: { userId } });
}

export type BoolRef = { current: boolean };

export async function saveFoundWordsOnce(
  guardRef: BoolRef,
  gameId: number | string | undefined,
  words: string[],
  qa: QuestionAnswer[]
): Promise<number> {
  const gid = Number(gameId);
  if (guardRef.current || !Number.isFinite(gid) || gid <= 0 || !words?.length)
    return 0;

  guardRef.current = true;
  try {
    const userId = Number(await getLoggedInUserId());
    if (!Number.isFinite(userId)) throw new Error("Not logged in");

    const map = new Map<string, number>();
    for (const q of qa ?? []) {
      const key = String(q?.answer ?? "").trim();
      const id = Number(q?.id);
      if (key && Number.isFinite(id)) map.set(key, id);
    }

    const payload = [
      ...new Set(words.map((w) => String(w).toUpperCase().trim())),
    ]
      .map((w) => {
        const qid = map.get(w);
        return qid ? { userId, wordData: { questionId: qid, word: w } } : null;
      })
      .filter(Boolean) as Array<{
      userId: number;
      wordData: { questionId: number; word: string };
    }>;

    if (!payload.length) {
      guardRef.current = false;
      return 0;
    }

    const res = await api.post(
      `/games/${encodeURIComponent(String(gid))}/wordfound/batch`,
      { foundWords: payload }
    );

    return (
      Number(res?.data?.data?.count ?? res?.data?.count ?? payload.length) ||
      payload.length
    );
  } catch (e: any) {
    guardRef.current = false;
    throw e;
  }
}

export type RecordExtraWordResponse = {
  created: boolean;
  totalExtra?: number;
  coinsAwarded?: number;
  newCoinBalance?: number;
  alreadyCounted?: boolean;
};

export async function recordExtraWord(gameId: number | string, word: string) {
  const userId = await getLoggedInUserId();
  if (!userId) throw new Error("Not logged in");

  const body = {
    userId: Number(userId),
    word: String(word || "")
      .trim()
      .toLowerCase(),
  };

  try {
    const { data } = await api.post(`/games/${gameId}/extraword`, body);
    return data;
  } catch (e) {
    return null;
  }
}

export const completeGame = async ({
  gameId,
  completed,
  finishedOnTime,
  wordsLearned,
  timeUsedSeconds,
  hintUsed,
  extraWordsCount,
  extraWords,
}: {
  gameId: number | string;
  completed?: boolean;
  finishedOnTime?: boolean;
  wordsLearned?: number;
  timeUsedSeconds?: number;
  hintUsed?: boolean;
  extraWordsCount?: number;
  extraWords?: string[];
}) => {
  const userId = await getLoggedInUserId();
  if (!userId) throw new Error("Not logged in");

  const body: any = { userId: Number(userId) };
  if (typeof completed === "boolean") body.completed = completed;
  if (typeof finishedOnTime === "boolean") body.finishedOnTime = finishedOnTime;
  if (typeof wordsLearned === "number") body.wordsLearned = wordsLearned;
  if (typeof timeUsedSeconds === "number")
    body.timeUsedSeconds = timeUsedSeconds;
  if (hintUsed) body.isHintUsed = true;
  if (typeof extraWordsCount === "number")
    body.extraWordsCount = extraWordsCount;
  if (Array.isArray(extraWords) && extraWords.length > 0)
    body.extraWords = extraWords;

  const { data } = await api.post(`/games/${gameId}/complete`, body);
  return data;
};
