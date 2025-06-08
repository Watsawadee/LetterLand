import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const getLoggedInUserId = async (): Promise<string | null> => {
  let token: string | null = null;

  if (Platform.OS === "web") {
    token = localStorage.getItem("user-token");
  } else {
    token = await SecureStore.getItemAsync("user-token");
  }

  if (!token) return null;

  try {
    const decoded: { userId: string | number } = jwtDecode(token);
    return decoded.userId.toString();
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};
