// src/services/getUserCEFR.ts
import axios from "axios";
import { getToken } from "@/utils/auth";
import { Platform } from "react-native";

const baseUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";
export const getUserProfile = async (): Promise<{
  id: number,
  username: string;
  coin: number;
  englishLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  email: string;
}> => {
  let token = await getToken();
  if (!token) {
    throw new Error("No token provided")
  }

  const response = await axios.get(
    `${baseUrl}/api/users/me/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
