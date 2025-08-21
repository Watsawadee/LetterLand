import axios from "axios";
import { Platform } from "react-native";
import { GetWordsOrError, SetupProfileRequest, SetupProfileResponse } from "../libs/type";
import { GetWordsOrErrorSchema, SetupProfileResponseSchema } from "../types/setup.schema";

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

export const getWords = async (): Promise<GetWordsOrError> => {
  try {
    const res = await axiosInstance.get(`${baseUrl}/setup/getwords`);
    return GetWordsOrErrorSchema.parse(res.data);
  } catch (error) {
    console.error("Error fetching words:", error);
    return { error: "Failed to fetch words" };
  }
};

export const setupProfile = async (
  payload: SetupProfileRequest
): Promise<SetupProfileResponse> => {
  try {
    const res = await axiosInstance.post<SetupProfileResponse>(`${baseUrl}/setup/setup-profile`,
      payload
    );

    return SetupProfileResponseSchema.parse(res.data);
  } catch (error) {
    console.error("Error submitting profile setup:", error);
    throw error;
  }
};
