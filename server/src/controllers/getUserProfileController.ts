import { Request, Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { UserProfileOrError } from "../types/type";
import { UserProfileResponseSchema } from "../types/userProfile.schema";
import { getNextLevel } from "../services/levelupService";
import { EnglishLevel } from "../types/setup.schema";
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<UserProfileOrError>
) => {

  const LEVEL_THRESHOLDS: Record<EnglishLevel, number> = {
    A1: 200 * 60 * 60,   // 200h to reach A2
    A2: 400 * 60 * 60,   // 400h total to reach B1
    B1: 600 * 60 * 60,   // 600h total to reach B2
    B2: 800 * 60 * 60,   // 800h total to reach C1
    C1: 1000 * 60 * 60,  // 1000h total to reach C2
    C2: Number.POSITIVE_INFINITY, // top; no next level
  };

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

    const requiredPlaytime = LEVEL_THRESHOLDS[user.englishLevel];
    const hasEnoughPlaytime =
      requiredPlaytime !== Number.POSITIVE_INFINITY &&
      user.total_playtime >= requiredPlaytime;

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