import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { DecodedToken } from "@/types/decodedJwtToken";

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === "web") {
    return localStorage.getItem("user-token");
  } else {
    return await SecureStore.getItemAsync("user-token");
  }
};
export const setToken = async (token: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.setItem("user-token", token);
  } else {
    await SecureStore.setItemAsync("user-token", token);
  }
};

export const getLoggedInUserId = async (): Promise<string | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    console.log(decoded)
    return decoded.userId.toString();
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

export const getDecodedToken = async (): Promise<DecodedToken | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};
