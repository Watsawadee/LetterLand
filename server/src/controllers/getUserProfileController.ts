import { Request, Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { UserProfileOrError } from "../types/type";
import { UserProfileResponseSchema } from "../types/userProfile.schema";
import { getNextLevel } from "../services/levelupService";
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<UserProfileOrError>
) => {

  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorised Access" })
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, coin: true, englishLevel: true, email: true, total_playtime: true, } })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return;
    }
    const nextLevel = getNextLevel(user.englishLevel) ?? null;

    const hasEnoughPlaytime = user.total_playtime >= 200 * 60 * 60;

    let canLevelUp = false;
    if (nextLevel) {
      const lastFive = await prisma.game.findMany({
        where: { userId, isFinished: true },
        orderBy: { finishedAt: "desc" },
        take: 5,
        select: { isHintUsed: true },
      });

      const fiveFinished = lastFive.length === 5;
      const noHintsUsed = fiveFinished && lastFive.every(g => !g.isHintUsed);

      canLevelUp = hasEnoughPlaytime && noHintsUsed;
    }

    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      coin: user.coin,
      englishLevel: user.englishLevel,
      nextLevel,
      canLevelUp,
    };

    res.status(200).json(UserProfileResponseSchema.parse(response));
  }
  catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}