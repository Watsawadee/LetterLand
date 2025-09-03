
// src/services/publicGameService.ts
import { Platform } from "react-native";
import api from "./api";
import { AxiosResponse } from "axios";
import { getToken } from "@/utils/auth";
import {
  ListPublicGamesResponse,
  PublicGameItem,
  StartPublicGameResponse,
} from "@/types/publicgametypes";

/**
 * GET /public/games
 */
export async function getPublicGames(
  limit = 10,
  offset = 0
): Promise<PublicGameItem[]> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const url = `/publicgame/games?limit=${limit}&offset=${offset}`;
  const baseURL =
    Platform.OS === "web" ? "http://localhost:3000" : api.defaults.baseURL;

  const res: AxiosResponse<ListPublicGamesResponse> = await api.get(url, {
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.items;
}

/**
 * POST /public/games/:templateId/start
 */
export async function startPublicGame(
  templateId: number
): Promise<StartPublicGameResponse> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const url = `/publicgame/games/${templateId}/start`;
  const baseURL =
    Platform.OS === "web" ? "http://localhost:3000" : api.defaults.baseURL;

  const res: AxiosResponse<StartPublicGameResponse> = await api.post(
    url,
    undefined,
    {
      baseURL,
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}