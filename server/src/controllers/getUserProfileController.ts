import { Request, Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { UserProfileOrError } from "../types/type";
import { UserProfileResponseSchema } from "../types/userProfile.schema";
import { getNextLevel } from "../services/levelupService";
import { EnglishLevel } from "../types/setup.schema";
import { addDays, differenceInMinutes, endOfWeek, startOfWeek } from "date-fns";

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<UserProfileOrError>
) => {

  const LEVEL_THRESHOLDS: Record<EnglishLevel, number> = {
    A1: 30,
    A2: 60,
    B1: 90,
    B2: 120,
    C1: 150,
    C2: 180,
  };
  const levels: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorised Access" })
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        coin: true,
        englishLevel: true,
        email: true,
        total_playtime: true,
        hint: true,
      }
    })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return;
    }

    // Count how many games the user has completed
    const completedGames = await prisma.game.count({
      where: { userId, isFinished: true },
    });

    const currentLevel = user.englishLevel;
    const currentIdx = levels.indexOf(currentLevel);
    const nextLevel = levels[Math.min(currentIdx + 1, levels.length - 1)];
    const requiredPlaytimeHours = LEVEL_THRESHOLDS[nextLevel];
    const prevThreshold = currentIdx > 0 ? LEVEL_THRESHOLDS[levels[currentIdx - 1]] : 0;
    const totalPlaytimeHours = user.total_playtime / 3600;

    // Progress for current level
    const playtimeForCurrentLevel = Math.max(totalPlaytimeHours - prevThreshold, 0);
    const progress = Math.min((playtimeForCurrentLevel / 200) * 100, 100);
    const progressPercent = Number(progress.toFixed(2));

    const requiredPlaytime = LEVEL_THRESHOLDS[user.englishLevel];

    const lastFive = await prisma.game.findMany({
      where: { userId, isFinished: true },
      orderBy: { finishedAt: "desc" },
      take: 5,
      select: { isHintUsed: true },
    });
    const hasUsedHintRecently = lastFive.some((g) => g.isHintUsed);

    let rawProgress = nextLevel
      ? Math.min(
        (user.total_playtime / requiredPlaytime) * 100,
        100
      )
      : 100;
    if (rawProgress >= 99 && hasUsedHintRecently) {
      rawProgress = 99;
    }
    const hasEnoughPlaytime =
      requiredPlaytime !== Number.POSITIVE_INFINITY &&
      user.total_playtime >= requiredPlaytime;


    const now = new Date();
    const startCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const endCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
    const startPrevWeek = addDays(startCurrentWeek, -7);
    const endPrevWeek = addDays(endCurrentWeek, -7);

    function avgDuration(games: { startedAt: Date; finishedAt: Date }[]) {
      if (games.length === 0) return 0;
      const total = games.reduce((sum, g) => sum + differenceInMinutes(g.finishedAt, g.startedAt), 0);
      return total / games.length;
    }

    const currentWeekGamesRaw = await prisma.game.findMany({
      where: {
        userId,
        isFinished: true,
        startedAt: { gte: startCurrentWeek, lte: endCurrentWeek },
      },
      select: { startedAt: true, finishedAt: true },
    });
    const prevWeekGamesRaw = await prisma.game.findMany({
      where: {
        userId,
        isFinished: true,
        startedAt: { gte: startPrevWeek, lte: endPrevWeek },
      },
      select: { startedAt: true, finishedAt: true },
    });
    const currentWeekGames = currentWeekGamesRaw.filter(g => g.finishedAt !== null) as { startedAt: Date; finishedAt: Date }[];
    const prevWeekGames = prevWeekGamesRaw.filter(g => g.finishedAt !== null) as { startedAt: Date; finishedAt: Date }[];

    const avgCurrentWeek = avgDuration(currentWeekGames);
    const avgPrevWeek = avgDuration(prevWeekGames);
    const hasImprovedPerformance = avgCurrentWeek < avgPrevWeek && avgPrevWeek > 0;
    // let canLevelUp = false;
    // if (nextLevel) {
    //   const lastFive = await prisma.game.findMany({
    //     where: { userId, isFinished: true },
    //     orderBy: { finishedAt: "desc" },
    //     take: 5,
    //     select: { isHintUsed: true },
    //   });

    //   const fiveFinished = lastFive.length === 5;
    //   const noHintsUsed = fiveFinished && lastFive.every(g => !g.isHintUsed);
    //   canLevelUp = hasEnoughPlaytime && noHintsUsed;
    // }

    const fiveFinished = lastFive.length === 5;
    const noHintsUsed = fiveFinished && lastFive.every((g) => !g.isHintUsed);
    const canLevelUp = hasEnoughPlaytime && noHintsUsed && hasImprovedPerformance;

    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      coin: user.coin,
      englishLevel: user.englishLevel,
      nextLevel,
      canLevelUp,
      progressPercent,
      hint: user.hint,
      completedGames,
    };

    res.status(200).json(UserProfileResponseSchema.parse(response));
  }
  catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}








