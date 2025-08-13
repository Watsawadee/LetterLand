// src/services/getUserCEFR.ts
import axios from "axios";
import { getToken } from "@/utils/auth";
import { Platform } from "react-native";
import { UserProfile } from "@/types/userProfile";

const baseUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";
export const getUserProfile = async (): Promise<UserProfile> => {
  let token = await getToken();
  if (!token) {
    throw new Error("No token provided")
  }

  const response = await axios.get<UserProfile>(
    `${baseUrl}/api/users/me/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
