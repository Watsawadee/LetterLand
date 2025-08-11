import axios from "axios";
import { Platform } from "react-native";

const baseUrl =
  // const baseUrl =
  // Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";
  // Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.101.118:8081";
  Platform.OS === "web"
    ? "http://localhost:3000"
    : Platform.OS === "android"
      ? "http://10.0.2.2:3000"
      : "http://192.168.101.118:3000";
// Platform.OS === "android"
//   ? "http://10.0.2.2:3000"
//   : "http://192.168.1.109:3000";
// Platform.OS === "android"
//   ? "http://10.0.2.2:3000"
//   : "http://192.168.101.118:8081";
// Platform.OS === "web"
//   ? "http://localhost:8081"
//   : Platform.OS === "android"
//   ? "http://10.0.2.2:3000"
//   : "http://192.168.101.118:3000";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getWords = async (): Promise<string[]> => {
  try {
    const res = await axiosInstance.get(`${baseUrl}/api/getwords`);
    return res.data.words
  } catch (error) {
    console.error("Error fetching words:", error);
    throw error;
  }
};

export const setupProfile = async (
  userId: number,
  age: number,
  selectedWords: string[]
) => {
  try {
    const res = await axiosInstance.post(`${baseUrl}/api/setup-profile`, {
      userId,
      age,
      selectedWords,
    });

    return res.data;
  } catch (error) {
    console.error("Error submitting profile setup:", error);
    throw error;
  }
};
