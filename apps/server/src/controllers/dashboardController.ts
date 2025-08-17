import prisma from "../configs/db";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import {
  TotalPlaytimeResponseSchema,
  WordsLearnedResponseSchema,
  GamesPlayedPerWeekResponseSchema,
} from "@letterland/shared";
import {
  TotalPlaytimeOrError, WordsLearnedOrError,
  GamesPlayedPerWeekOrError,
} from "../types/type"
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

    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    const end = endOfWeek(new Date(), { weekStartsOn: 0 });
    const games = await prisma.game.findMany({
      where: {
        userId,
        startedAt: {
          gte: start,
          lte: end,
        },
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
      const label = format(game.startedAt, "E").slice(0, 2);
      if (result[label] !== undefined) result[label]++;
    });

    const labels = days.map(day => format(day, "E").slice(0, 2));
    const counts = labels.map(label => result[label] || 0);
    const response = GamesPlayedPerWeekResponseSchema.parse({
      labels,
      counts,
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};