// types/setting.schema.ts
import { z } from "zod";

export const UpdateUserSettingSchema = z.object({
    newUsername: z.string().optional(),
    newEmail: z.string().email().optional(),
}).refine((data) => data.newUsername || data.newEmail, {
    message: "At least one field (username or email) must be provided.",
});

export const UpdateUserProfileResponse = z.object({
    message: z.string(),
    token: z.string()
});
