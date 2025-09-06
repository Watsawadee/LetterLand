
import { Platform } from "react-native";
import api from "./api";
import { AxiosResponse } from "axios";
import { getToken } from "@/utils/auth";
import {
  ListPublicGamesResponse,
  PublicGameItem,
  StartPublicGameResponse,
} from "@/types/publicgametypes";

export async function getPublicGames(
  limit = 40,
  offset = 0
): Promise<PublicGameItem[]> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const url = `/publicgame/games?limit=${limit}&offset=${offset}`;

  const res: AxiosResponse<ListPublicGamesResponse> = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.items;
}

export async function startPublicGame(
  templateId: number
): Promise<StartPublicGameResponse> {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");

  const url = `/publicgame/games/${templateId}/start`;

  const res: AxiosResponse<StartPublicGameResponse> = await api.post(
    url,
    undefined,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}