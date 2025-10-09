import api from "./api";
import { AxiosResponse } from "axios";
import { getToken } from "@/utils/auth";
import {
  ListPublicGamesResponse,
  PublicGameItem,
  StartPublicGameResponse,
  PublicGameType,
} from "@/types/publicgametypes";

export async function getPublicGames(limit = 40, offset = 0): Promise<PublicGameItem[]> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const url = `/publicgame/games?limit=${limit}&offset=${offset}`;
  const res: AxiosResponse<ListPublicGamesResponse> = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.items;
}

export async function startPublicGame(
  templateId: number,
  body?: { newType?: PublicGameType; timerSeconds?: number | null }
): Promise<StartPublicGameResponse> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const url = `/publicgame/games/${templateId}/start`;
  const res: AxiosResponse<StartPublicGameResponse> = await api.post(url, body ?? {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function checkPublicGamePlayed(
  templateId: number,
  params: { newType?: PublicGameType; timerSeconds?: number | undefined }
): Promise<{ alreadyPlayed: boolean }> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const res: AxiosResponse<{ alreadyPlayed: boolean }> = await api.get(
    `/publicgame/games/${templateId}/played`,
    {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}
