import { Platform } from "react-native";
import axios from "axios";
// import { LoginResponse, RegisterResponse } from "@/types/auth";
import { getToken } from "@/utils/auth";
import * as SecureStore from "expo-secure-store";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/libs/type";
import { LoginResponseSchema, RegisterResponseSchema } from "../../shared/schemas/auth.schema";
// const baseUrl =
// const baseUrl =
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.101.118:8081";
const baseUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";
// const baseUrl = "http://10.0.2.2:3000"



export const registerUser = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const res = await axios.post<RegisterResponse>(
    `${baseUrl}/api/users/auth/register`,
    payload
  );

  return RegisterResponseSchema.parse(res.data);
};

export const loginUser = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await axios.post(`${baseUrl}/api/users/auth/login`, payload);
    const token = res.data.token;
    if (Platform.OS === "web") {
      localStorage.setItem("user-token", token);
    } else {
      await SecureStore.setItemAsync("user-token", token);
    }

    return LoginResponseSchema.parse(res.data)
  }
  catch (error: any) {
    throw new Error("Failed to login")
  }
};
