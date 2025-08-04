import { Platform } from "react-native";
import axios from "axios";
// const baseUrl =
// const baseUrl =
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.1.109:3000";
// Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://192.168.101.118:8081";
const baseUrl =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";
// const baseUrl = "http://10.0.2.2:3000"
interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
interface User {
  id: number;
  email: string;
  username: string;
}
interface RegisterResponse {
  user: User;
  token: string;
}
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

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${baseUrl}/api/users/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Login Failed");
  }

  const data = await res.json();
  return {
    user: data.user,
    token: data.token,
  };
};
