import { Request, Response } from "express"
import prisma from "../configs/db";
import { UpdateUserSettingSchema } from "../types/setting.schema";
import jwt from "jsonwebtoken";


export const updateUserSetting = async (req: Request, res: Response): Promise<void> => {
    const parsed = UpdateUserSettingSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid input",
            issues: parsed.error.issues
        });
        return;
    }
    const userId = (req as any).user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { newUsername, newEmail } = parsed.data;

    try {
        if (newUsername) {
            const usernameExists = await prisma.user.findFirst({
                where: {
                    username: newUsername,
                    NOT: { id: userId },
                },
            });
            if (usernameExists) {
                res.status(409).json({ message: "Username is already taken" });
                return;
            }
        }
        if (newEmail) {
            const emailExists = await prisma.user.findFirst({
                where: {
                    email: newEmail.toLowerCase(),
                    NOT: { id: userId },
                },
            });
            if (emailExists) {
                res.status(409).json({ message: "Email is already taken" })
                return;
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(newUsername && { username: newUsername }),
                ...(newEmail && { email: newEmail.toLowerCase() }),
            },
        });
        const JWT_SECRET = process.env.JWT_SECRET!;
        const token = jwt.sign({
            userId: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            hasCompletedSetup: !!(updatedUser.age && updatedUser.englishLevel),
        }, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            message: "User settings updated",
            token,
        });
    } catch (error) {
        console.error("Update user settings error:", error);
        res.status(500).json({
            message: "Failed to update user settings",
            error: (error as Error).message,
        });

    }
};