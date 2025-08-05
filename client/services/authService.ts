import { Platform } from "react-native";
import axios from "axios";
import { LoginResponse, RegisterResponse } from "@/types/auth";
import { getToken } from "@/utils/auth";
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
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const res = await axios.post<RegisterResponse>(
    `${baseUrl}/api/users/auth/register`,
    {
      username,
      email,
      password,
    }
  );

  return res.data;
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const res = await axios.post(`${baseUrl}/api/users/auth/login`, { email, password });
    return res.data;
  }
  catch (error: any) {
    throw new Error("Failed to login")
  }
};
