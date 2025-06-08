// src/services/getUserCEFR.ts
import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const getUserCEFR = async (
  userId: string
): Promise<{ englishLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" }> => {
  // ✅ Cross-platform token retrieval
  let token: string | null;

  if (Platform.OS === "web") {
    token = localStorage.getItem("user-token");
  } else {
    token = await SecureStore.getItemAsync("user-token");
  }

  if (!token) throw new Error("Missing token");

  const response = await axios.get(
    `http://localhost:3000/api/users/user/${userId}/cefr`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
