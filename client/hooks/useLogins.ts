import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";
import { LoginRequest, LoginResponse } from "../libs/type";
interface LoginInput {
  email: string;
  password: string;
}

export const useLogin = (
  onSuccess: (data: LoginResponse) => void
): UseMutationResult<LoginResponse, Error, LoginRequest> =>
  useMutation<LoginResponse, Error, LoginRequest>({
    mutationKey: ["auth", "login"],
    mutationFn: (payload) => loginUser(payload),
    onSuccess,
    onError: (err) => {
      console.error("Login failed", err);
    },
  });
