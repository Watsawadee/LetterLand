import { ProgressLevelupParams, ProgressLevelupResponse } from "@/libs/type"
import { progressLevelup } from "@/services/progressLevelupService"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"

export const useProgressLevelup = (token: string, onSuccess?: (data: ProgressLevelupResponse) => void, onError?: (error: AxiosError<{ message: string }>) => void) => {
    return useMutation({
        mutationKey: ["progress-level-up"],
        mutationFn: ((payload: ProgressLevelupParams) => progressLevelup(payload, token))
        , onSuccess, onError
    })
}