import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { registerUser } from "@/services/authService";
import { Alert } from "react-native";

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

export const useRegister = (
  onSuccess: (data: RegisterResponse) => void
): UseMutationResult<RegisterResponse, Error, RegisterInput> =>
  useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: (payload) =>
      registerUser(payload),
    onSuccess,
  });
