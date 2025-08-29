// src/services/getUserCEFR.ts
import axios from "axios";
import { getToken } from "@/utils/auth";
import { Platform } from "react-native";
import { UserProfileOrError } from "@/libs/type";
import { UserProfileOrErrorSchema } from "../types/userProfile.schema";

const baseUrl = "http://10.4.56.20:3000"
// Platform.OS === "android"
//   ? "http://10.0.2.2:3000"
//   : "http://localhost:3000";
export const getUserProfile = async (): Promise<UserProfileOrError> => {
  try {
    let token = await getToken();
    if (!token) {
      throw new Error("No token provided")
    }

    const response = await axios.get<UserProfileOrError>(
      `${baseUrl}/users/me/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return UserProfileOrErrorSchema.parse(response.data)
  }
  catch (error) {
    return { error: "Failed to fetch user profile" };
  }
};
