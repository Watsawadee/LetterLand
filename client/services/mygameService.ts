// /src/services/mygameService.ts
import { Platform } from "react-native";
import api from "./api";
import { AxiosResponse } from "axios";
import { GetUserGamesResponse } from "../../server/src/types/mygame";
import { getLoggedInUserId, getToken } from "@/utils/auth";

// Fetch user games
export async function getUserGames(
  userIdParam?: number
): Promise<GetUserGamesResponse["items"]> {
  const token = await getToken();
  const userId = userIdParam ?? (await getLoggedInUserId());
  if (!token || !userId) throw new Error("Not logged in");

  const url = `/mygame/user/${userId}/mygame`;
  const baseURL =
    Platform.OS === "web" ? "http://localhost:3000" : api.defaults.baseURL;

  const res: AxiosResponse<GetUserGamesResponse> = await api.get(url, {
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.items;
}

// Helper function to construct the full image URL
export async function getCardBGImage(imageUrl: string): Promise<string> {
  const baseUrl = "http://10.4.56.20:3000/images/image/"; // Your base URL
  return `${baseUrl}${imageUrl}.png`;  // Append the file extension to form the full URL
}
