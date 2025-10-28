import { Request, Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { UserProfileOrError } from "../types/type";
import { UserProfileResponseSchema } from "../types/userProfile.schema";
import { getNextLevel, secondsBetween, startOfISOWeekUTC } from "../services/levelupService";
import { EnglishLevel } from "../types/setup.schema";
import { addDays, differenceInMinutes, endOfWeek, startOfISOWeek, startOfWeek } from "date-fns";

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<UserProfileOrError>
) => {

  const LEVEL_THRESHOLDS: Record<EnglishLevel, number> = {
    A1: 30 * 60 * 60,
    A2: 60 * 60 * 60,
    B1: 90 * 60 * 60,
    B2: 120 * 60 * 60,
    C1: 150 * 60 * 60,
    C2: 180 * 60 * 60,
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

    // Progress current level
    const playtimeForCurrentLevel = Math.max(totalPlaytimeHours - prevThreshold, 0);
    const progress = Math.min((playtimeForCurrentLevel / 30) * 100, 100);

    const requiredPlaytime = LEVEL_THRESHOLDS[currentLevel];
    const progressPercent = Number(Math.min((user.total_playtime / requiredPlaytime) * 100, 100).toFixed(2));

    const lastFive = await prisma.game.findMany({
      where: { userId, isFinished: true, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 5,
      select: { isHintUsed: true },
    });
    const fiveFinished = lastFive.length === 5;
    const noHintsUsed = fiveFinished && lastFive.every((g) => !g.isHintUsed);

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

    console.log("Playtime check", {
      total_playtime: user.total_playtime,
      requiredPlaytime,
      result: user.total_playtime >= requiredPlaytime
    });

    const hasEnoughPlaytime =
      requiredPlaytime !== Number.POSITIVE_INFINITY &&
      user.total_playtime >= requiredPlaytime;


    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const lastWeekStart = addDays(thisWeekStart, -7);
    const lastWeekEnd = addDays(thisWeekEnd, -7);

    const currentWeekGamesRaw = await prisma.game.findMany({
      where: {
        userId,
        isFinished: true,
        startedAt: { gte: thisWeekStart, lte: now },
      },
      select: { startedAt: true, finishedAt: true },
    });
    const prevWeekGamesRaw = await prisma.game.findMany({
      where: {
        userId,
        isFinished: true,
        startedAt: { gte: lastWeekStart, lte: lastWeekEnd },
      },
      select: { startedAt: true, finishedAt: true },
    });
    const currentWeekGames = currentWeekGamesRaw.filter(g => g.finishedAt !== null) as { startedAt: Date; finishedAt: Date }[];
    const prevWeekGames = prevWeekGamesRaw.filter(g => g.finishedAt !== null) as { startedAt: Date; finishedAt: Date }[];
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

    const avg = (games: { startedAt: Date; finishedAt: Date | null }[]) => {
      const finished = games.filter((g) => g.finishedAt);
      if (finished.length === 0) return 0;
      const total = finished.reduce(
        (acc, g) => acc + secondsBetween(g.startedAt, g.finishedAt!),
        0
      );
      return total / finished.length;
    };


    const avgCurrentWeek = avg(currentWeekGames);
    const avgPrevWeek = avg(prevWeekGames);
    const hasImprovedPerformance = avgCurrentWeek < avgPrevWeek && avgPrevWeek > 0 && currentWeekGames.length > 0;

    const canLevelUp = hasEnoughPlaytime && noHintsUsed && hasImprovedPerformance && fiveFinished;
    console.log("Check", {
      hasEnoughPlaytime,
      noHintsUsed,
      fiveFinished,
      hasImprovedPerformance
    });
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








