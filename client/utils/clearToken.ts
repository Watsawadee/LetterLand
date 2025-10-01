import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store"


export const clearToken = async () => {
    if (Platform.OS === "web") {
        localStorage.removeItem("user-token");
    } else {
        await SecureStore.deleteItemAsync("user-token");
    }
};