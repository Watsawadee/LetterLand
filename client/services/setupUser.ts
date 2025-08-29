import axios from "axios";
import { Platform } from "react-native";
import { GetWordsOrError, SetupProfileRequest, SetupProfileResponse } from "../libs/type";
import { GetWordsOrErrorSchema, SetupProfileResponseSchema } from "../types/setup.schema";
import api from "./api";

const baseUrl = "http://10.4.56.20:3000"
// const baseUrl =
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.101.118:8081";
// Platform.OS === "web"
//   ? "http://localhost:3000"
//   : Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://192.168.101.118:3000";
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


export const getWords = async (): Promise<GetWordsOrError> => {
  try {
    const res = await api.get(`/setup/getwords`);
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
    const res = await api.post<SetupProfileResponse>(`/setup/setup-profile`,
      payload
    );

    return SetupProfileResponseSchema.parse(res.data);
  } catch (error) {
    console.error("Error submitting profile setup:", error);
    throw error;
  }
};
