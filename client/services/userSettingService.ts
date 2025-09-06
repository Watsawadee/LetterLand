import api from "./api";
import { UpdateUserProfileInput } from "@/libs/type";
import { UpdateUserProfileResponse } from "@/libs/type";
import { getToken } from "@/utils/auth";

async function getAuthHeader() {
    const token = await getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}
export const updateUserSetting = async (
    payload: UpdateUserProfileInput
): Promise<UpdateUserProfileResponse> => {
    const config = await getAuthHeader();
    const res = await api.put("/setting/updateUserProfile", payload, config);
    return res.data;
};
