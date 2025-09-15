import { ProgressLevelupParams, ProgressLevelupResponse } from "@/libs/type";
import api from "./api";

export const progressLevelup = async (Payload: ProgressLevelupParams, token: string) => {
    const res = await api.put<ProgressLevelupResponse>("/users/progress", Payload,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    return res.data
}