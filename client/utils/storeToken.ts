// utils/storeToken.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const storeToken = async (token: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem("user-token", token);
  } else {
    await SecureStore.setItemAsync("user-token", token);
  }
};
