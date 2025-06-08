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

export const getWords = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${baseUrl}/api/getwords`);

    if (!res.ok) {
      console.error("Failed to fetch words:", res.status);
      throw new Error("Failed to fetch words");
    }

    const data = await res.json();
    return data.words;
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
    const res = await fetch(`${baseUrl}/api/setup-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, age, selectedWords }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to setup profile:", data);
      throw new Error(data.error || "Setup profile failed");
    }

    return data;
  } catch (error) {
    console.error("Error submitting profile setup:", error);
    throw error;
  }
};
