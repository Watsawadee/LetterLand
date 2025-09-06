// hooks/useUpdateUserSetting.ts
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { updateUserSetting } from "@/services/userSettingService";
import { UpdateUserProfileInput, UpdateUserProfileResponse } from "@/libs/type";
import { AxiosError } from "axios";
import { Alert } from "react-native";

export const useUpdateUserSetting = (
    onSuccess?: (data: UpdateUserProfileResponse) => void
): UseMutationResult<UpdateUserProfileResponse, Error, UpdateUserProfileInput> => {
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ["user", "update-setting"],
        mutationFn: updateUserSetting,
        onSuccess: async (data) => {
            await qc.invalidateQueries({ queryKey: ["userProfile"] });
            onSuccess?.(data);
        },
        onError: (err) => {
            console.error("Update settings failed", err);
            const axiosErr = err as AxiosError<{ message: string }>;
            if (axiosErr.response?.status === 409) {
                Alert.alert("Conflict", axiosErr.response.data.message || "Username or email already taken");
            } else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        }
    });
};
