import prisma from "../configs/db";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks } from "date-fns";
import {
  TotalPlaytimeResponseSchema,
  WordsLearnedResponseSchema,
  GamesPlayedPerWeekResponseSchema,
  AverageGamesByLevelResponseSchema,
} from "../types/dashboard.schema";
import {
  TotalPlaytimeOrError,
  GamesPlayedPerWeekOrError,
  AverageGamesByLevelOrError,
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
    const response = TotalPlaytimeResponseSchema.parse({ totalPlaytime: user.total_playtime, })
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
    const base = addWeeks(new Date(), offSet);
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
      const label = format(day, "EEE").slice(0, 2); // 'Su', 'Mo', 'Tu', etc.
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
export const getAverageGamesPlayedByLevel = async (req: AuthenticatedRequest, res: Response<AverageGamesByLevelOrError>): Promise<void> => {
  try {
    const userId = Number(req.params.userId)
    const loggedInUserId = req.user?.id;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    if (userId !== loggedInUserId) {
      res.status(403).json({ error: "Forbidden: Cannot access others’ stats" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { englishLevel: true }
    })
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const level = user.englishLevel;
    const offSet = Number(req.query.offSet ?? 0);
    if (Number.isNaN(offSet)) {
      res.status(400).json({ error: "Invalid Offset" })
      return;
    }
    const base = addWeeks(new Date(), offSet);
    const start = startOfWeek(base, { weekStartsOn: 0 });
    const end = endOfWeek(base, { weekStartsOn: 0 });

    const allUsers = await prisma.user.findMany({
      where: {
        englishLevel: level,
        NOT: { id: userId },
      },
      select: { id: true }
    });
    const userIds = allUsers.map(u => u.id);
    const games = await prisma.game.findMany({
      where: {
        userId: { in: userIds },
        isFinished: true,
        startedAt: { gte: start, lte: end },
      },
      select: {
        userId: true,
        startedAt: true,
      },
    });
    const days = eachDayOfInterval({ start, end });
    const dayLabels = days.map(day => format(day, "yyyy-MM-dd"));

    const gamesPerDay: Record<string, Record<number, number>> = {};
    for (const label of dayLabels) {
      gamesPerDay[label] = {};
      for (const uid of userIds) {
        gamesPerDay[label][uid] = 0;
      }
    }
    for (const game of games) {
      const dayLabel = format(game.startedAt, "yyyy-MM-dd");
      if (gamesPerDay[dayLabel] && gamesPerDay[dayLabel][game.userId] !== undefined) {
        gamesPerDay[dayLabel][game.userId]++;
      }
    }

    // For each day, calculate average
    const averages: { date: string; averageGamesPlayed: number }[] = [];
    for (const label of dayLabels) {
      const totalGames = Object.values(gamesPerDay[label]).reduce((a, b) => a + b, 0);
      const avg = userIds.length > 0 ? totalGames / userIds.length : 0;
      averages.push({ date: label, averageGamesPlayed: avg });
    }

    const response = AverageGamesByLevelResponseSchema.parse({
      englishLevel: level,
      averages,
      userCount: userIds.length,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      offSet,
    });
    res.status(200).json(response);

    // const totalGames = gameCounts.reduce((sum, g) => sum + g._count.id, 0)
    // const average = userCount > 0 ? totalGames / userCount : 0;
    // const response = AverageGamesByLevelResponseSchema.parse({
    //   englishLevel: level,
    //   averageGamesPlayedThisWeek: average,
    //   userCount,
    //   range: {
    //     start: start.toISOString(),
    //     end: end.toISOString(),
    //   },
    //   offSet,
    // });

    // res.status(200).json(response);

  }
  catch (error) {

  }
}