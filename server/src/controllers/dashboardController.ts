import prisma from "../configs/db";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks } from "date-fns";
import {
  TotalPlaytimeResponseSchema,
  WordsLearnedResponseSchema,
  GamesPlayedPerWeekResponseSchema,
  AverageGamesByLevelResponseSchema,
  AverageGamesEachDayResponseSchema,
} from "../types/dashboard.schema";
import {
  TotalPlaytimeOrError, WordsLearnedOrError,
  GamesPlayedPerWeekOrError,
  AverageGamesByLevelOrError,
  AverageGamesEachDayOrError,
} from "../types/type"
import { EnglishLevel } from "@prisma/client";
export const getUserTotalPlaytime = async (
  req: AuthenticatedRequest,
  res: Response<TotalPlaytimeOrError>
): Promise<void> => {
  const userId = Number(req.params.userId);
  const loggedInUserId = req.user?.id;

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  if (userId !== loggedInUserId) {
    res
      .status(400)
      .json({ error: "Forbidden: Cant view other user's playtime" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { total_playtime: true },
    });
    if (!user) {
      res.status(200).json({ error: "User is not exist" });
      return;
    }
    const totalPlaytimeHours = user.total_playtime / 3600;
    const response = TotalPlaytimeResponseSchema.parse({ totalPlaytime: Number(totalPlaytimeHours.toFixed(2)), })
    res.status(200).json(response);
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export const getUserWordLearned = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = Number(req.params.userId);
  const loggedInUserId = req.user?.id;

  console.log("👉 URL userId:", userId);
  console.log("👉 Logged in userId:", loggedInUserId);

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }

  if (userId !== loggedInUserId) {
    res
      .status(403)
      .json({ error: "Forbidden: You cant access others user's data" });
    return;
  }

  try {
    const wordCount = await prisma.wordFound.findMany({
      where: { userId },
      select: { word: true }
    });

    const uniqueWords = new Set(wordCount.map((w: { word: string }) => w.word));
    const response = WordsLearnedResponseSchema.parse({
      wordsLearned: uniqueWords.size,
    });

    res.status(200).json(response);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserGamesPlayedPerWeek = async (
  req: AuthenticatedRequest,
  res: Response<GamesPlayedPerWeekOrError>
): Promise<void> => {
  const userId = Number(req.params.userId);
  const loggedInUserId = req.user?.id;
  if (userId !== loggedInUserId) {
    res.status(403).json({ error: "Forbidden: Data cant be accessed" });
    return;
  }

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  try {
    const offSet = Number(req.query.offset ?? 0);
    if (Number.isNaN(offSet)) {
      res.status(400).json({ error: "Invalid offset" });
      return;
    }
    const now = new Date();
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const base = addWeeks(localMidnight, offSet);
    const start = startOfWeek(base, { weekStartsOn: 0 });
    const end = endOfWeek(base, { weekStartsOn: 0 });

    const games = await prisma.game.findMany({
      where: {
        userId,
        startedAt: {
          gte: start,
          lte: end,
        },
        isFinished: true
      },
      select: {
        startedAt: true,
      },
    });

    const days = eachDayOfInterval({ start, end });
    const result: Record<string, number> = {};

    days.forEach((day, idx) => {
      const label = format(day, "E").slice(0, 2); // 'Su', 'Mo', 'Tu', etc.
      result[label] = 0;
    });

    games.forEach((game: { startedAt: Date }) => {
      const label = format(game.startedAt, "EEE").slice(0, 2);
      if (result[label] !== undefined) result[label]++;
    });

    const labels = days.map(day => format(day, "EEE").slice(0, 2));
    const bucket: Record<string, number> = Object.fromEntries(labels.map(l => [l, 0]));

    for (const g of games) {
      const key = format(g.startedAt, "EEE").slice(0, 2);
      if (key in bucket) bucket[key] += 1;
    }
    const counts = labels.map(l => bucket[l] ?? 0);
    const payload = {
      labels,
      counts,
      range: { start: start.toISOString(), end: end.toISOString() },
      weekLabel: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
      offSet,
    };
    const response = GamesPlayedPerWeekResponseSchema.parse(payload);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Average Gameplayed of others user 
export const getAverageGamesPlayedByLevel = async (
  req: AuthenticatedRequest,
  res: Response<AverageGamesByLevelOrError>
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const loggedInUserId = req.user?.id;

    if (!userId) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    if (userId !== loggedInUserId) {
      res.status(403).json({ error: "Forbidden: Cannot access others’ stats" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { englishLevel: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const level = user.englishLevel;
    const offSet = Number(req.query.offSet ?? 0);
    if (Number.isNaN(offSet)) {
      res.status(400).json({ error: "Invalid offset" });
      return;
    }

    const now = new Date();
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const base = addWeeks(localMidnight, offSet);
    const start = startOfWeek(base, { weekStartsOn: 0 });
    const end = endOfWeek(base, { weekStartsOn: 0 });

    // Step 1: get all users at the same level (excluding self)
    const sameLevelUsers = await prisma.user.findMany({
      where: {
        englishLevel: level,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    const sameLevelUserIds = sameLevelUsers.map((u) => u.id);

    if (sameLevelUserIds.length === 0) {
      res.status(200).json({
        englishLevel: level,
        averageGamesPlayedThisWeek: 0,
        userCount: 0,
        range: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        offSet,
      });
      return;
    }

    // Step 2: count games per user for those IDs
    const gameCounts = await prisma.game.groupBy({
      by: ["userId"],
      where: {
        userId: { in: sameLevelUserIds },
        isFinished: true,
        startedAt: { gte: start, lte: end },
      },
      _count: { id: true },
    });

    const totalGames = gameCounts.reduce((sum, g) => sum + g._count.id, 0);
    const average = totalGames / sameLevelUserIds.length;

    // Step 3: return parsed response
    const response = AverageGamesByLevelResponseSchema.parse({
      englishLevel: level,
      averageGamesPlayedThisWeek: average,
      userCount: sameLevelUserIds.length,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      offSet,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error computing average:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAverageGamesEachDayByLevel = async (req: AuthenticatedRequest,
  res: Response<AverageGamesEachDayOrError>): Promise<void> => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const offSet = Number(req.query.offset ?? 0)
    if (Number.isNaN(offSet)) {
      res.status(400).json({ error: "Invalid offset" });
      return;
    }
    const base = addWeeks(new Date(), offSet);
    const start = startOfWeek(base, { weekStartsOn: 0 });
    const end = endOfWeek(base, { weekStartsOn: 0 });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { englishLevel: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userLevel = user.englishLevel
    if (!userLevel) {
      res.status(404).json({ error: "English Level not found" });
      return;
    }
    const sameLevelUsers = await prisma.user.findMany({
      where: {
        englishLevel: userLevel,
        NOT: { id: userId },
      },
      select: { id: true },
    });
    const sameLevelUserIds = sameLevelUsers.map((u) => u.id);
    const peerCount = sameLevelUserIds.length;
    const days = eachDayOfInterval({ start, end });
    const labels = days.map(day => format(day, "EEE").slice(0, 2));
    if (peerCount === 0) {
      const zeroCounts = labels.map(() => 0);
      const payload = {
        englishLevel: userLevel,
        userCount: 0,
        labels,
        counts: zeroCounts,
        weekLabel: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
        offSet,
      };
      const response = AverageGamesEachDayResponseSchema.parse(payload);
      res.status(200).json(response as any);
      return;
    }
    const peerGames = await prisma.game.findMany({
      where: {
        userId: { in: sameLevelUserIds },
        isFinished: true,
        startedAt: { gte: start, lte: end },
      },
      select: {
        startedAt: true,
      },
    });

    const dailyTotalGames: Record<string, number> = Object.fromEntries(labels.map(l => [l, 0]));
    peerGames.forEach((game) => {
      const key = format(game.startedAt, "EEE").slice(0, 2);
      if (key in dailyTotalGames) {
        dailyTotalGames[key] += 1;
      }
    });
    const dailyAverages = labels.map(dayLabel =>
      Number((dailyTotalGames[dayLabel] / peerCount).toFixed(2))
    );
    const payload = {
      englishLevel: userLevel,
      userCount: peerCount,
      labels,
      counts: dailyAverages,
      weekLabel: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
      offSet,
    };

    const response = AverageGamesEachDayResponseSchema.parse(payload);
    res.status(200).json(response as any);
  }
  catch (error: any) {
    console.error("❌ Error computing daily average peer games:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}