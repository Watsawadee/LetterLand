import { Platform } from "react-native";
import axios from "axios";
import api from "./api";
// import { LoginResponse, RegisterResponse } from "@/types/auth";
import { getToken } from "@/utils/auth";
import * as SecureStore from "expo-secure-store";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/libs/type";
import { LoginResponseSchema, RegisterResponseSchema } from "../types/auth.schema"
// const baseUrl =
// const baseUrl =
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";


export const registerUser = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const res = await api.post<RegisterResponse>(
    `/users/auth/register`,
    payload
  );

  return RegisterResponseSchema.parse(res.data);
};

export const loginUser = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await api.post(`/users/auth/login`, payload);
    const token = res.data.token;
    if (Platform.OS === "web") {
      localStorage.setItem("user-token", token);
    } else {
      await SecureStore.setItemAsync("user-token", token);
    }

    return LoginResponseSchema.parse(res.data)
  }
  catch (error: any) {
    throw new Error(error)
  }
};
