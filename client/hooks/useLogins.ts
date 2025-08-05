import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";
import { LoginResponse } from "@/types/auth";
interface LoginInput {
  email: string;
  password: string;
}

export const useLogin = (
  onSuccess: (data: LoginResponse) => void
): UseMutationResult<LoginResponse, Error, LoginInput> =>
  useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess,
    onError: (err) => {
      console.error("Login failed", err);
    },
  });
