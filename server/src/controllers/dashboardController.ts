import prisma from "../configs/db";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, startOfDay, isSameDay, addDays } from "date-fns";
import {
  TotalPlaytimeResponseSchema,
  WordsLearnedResponseSchema,
  GamesPlayedPerPeriodResponseSchema,
  AverageGamesByLevelPeerPeriodResponseSchemaOrErrorSchema,
  AverageGamesByLevelPeerPeriodResponseSchema,
} from "../types/dashboard.schema";
import {
  TotalPlaytimeOrError, WordsLearnedOrError,
  GamesPlayedPerPeriodOrError,
  AverageGamesByLevelPeerOrError,
} from "../types/type"
import { EnglishLevel } from "@prisma/client";
import { getPeriodRange } from "../services/getPeriodRange";
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
    res.status(403).json({ error: "Forbidden: Cant view other user's playtime" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { total_playtime: true },
    });
    if (!user) {
      res.status(404).json({ error: "User does not exist" });
      return;
    }
    const totalPlaytimeHours = user.total_playtime / 3600;
    const response = TotalPlaytimeResponseSchema.parse({
      totalPlaytime: Number(totalPlaytimeHours.toFixed(2)),
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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

export const getUserGamesPlayedPerPeriod = async (
  req: AuthenticatedRequest,
  res: Response<GamesPlayedPerPeriodOrError>
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
    const period = (req.query.period as string) || "week";
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    if (!["week", "month", "year"].includes(period)) {
      res.status(400).json({ error: "Invalid period" });
      return;
    }
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date" });
      return;
    }
    let start: Date, end: Date;
    try {
      ({ start, end } = getPeriodRange(period, date));
    } catch {
      res.status(400).json({ error: "Invalid period" });
      return;
    }

    const games = await prisma.game.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end },
        isFinished: true
      },
      select: { startedAt: true },
    });

    let labels: string[] = [];
    let counts: number[] = [];
    if (period === "week") {
      const days = eachDayOfInterval({ start, end });
      labels = days.map(day => format(day, "EEE").slice(0, 2));
      const bucket: Record<string, number> = Object.fromEntries(labels.map(l => [l, 0]));
      games.forEach(g => {
        const key = format(g.startedAt, "EEE").slice(0, 2);
        if (key in bucket) bucket[key]++;
      });
      counts = labels.map(l => bucket[l] ?? 0);
    } else if (period === "month") {
      let current = startOfWeek(start, { weekStartsOn: 0 });
      let weekIdx = 1;
      const buckets: { start: Date, end: Date }[] = [];
      while (current <= end) {
        const weekStart = current < start ? start : current;
        const weekEnd = endOfWeek(current, { weekStartsOn: 0 }) > end ? end : endOfWeek(current, { weekStartsOn: 0 });
        buckets.push({ start: weekStart, end: weekEnd });
        labels.push(`W${weekIdx++}`);
        current = addWeeks(current, 1);
      }
      counts = buckets.map(({ start: bStart, end: bEnd }) =>
        games.filter(g => g.startedAt >= bStart && g.startedAt <= bEnd).length
      );
    } else if (period === "year") {
      labels = Array.from({ length: 12 }, (_, i) => format(new Date(date.getFullYear(), i, 1), "MMM"));
      const bucket: Record<string, number> = Object.fromEntries(labels.map(l => [l, 0]));
      games.forEach(g => {
        const key = format(g.startedAt, "MMM");
        if (key in bucket) bucket[key]++;
      });
      counts = labels.map(l => bucket[l] ?? 0);
    }

    const response = GamesPlayedPerPeriodResponseSchema.parse({
      labels,
      counts,
      range: { start: start.toISOString(), end: end.toISOString() },
      period,
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getAverageGamesPlayedByLevel = async (
//   req: AuthenticatedRequest,
//   res: Response<AverageGamesByLevelOrError>
// ): Promise<void> => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(400).json({ error: "Invalid user ID" });
//       return;
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { englishLevel: true },
//     });

//     if (!user) {
//       res.status(404).json({ error: "User not found" });
//       return;
//     }

//     const level = user.englishLevel;
//     const period = (req.query.period as string) || "week";
//     const date = req.query.date ? new Date(req.query.date as string) : new Date();
//     let start: Date, end: Date;
//     try {
//       ({ start, end } = getPeriodRange(period, date));
//     } catch {
//       res.status(400).json({ error: "Invalid period" });
//       return;
//     }

//     // Get all users at the same level (excluding self)
//     const sameLevelUsers = await prisma.user.findMany({
//       where: {
//         englishLevel: level,
//         NOT: { id: userId },
//       },
//       select: { id: true },
//     });

//     const sameLevelUserIds = sameLevelUsers.map((u) => u.id);

//     if (sameLevelUserIds.length === 0) {
//       const response = AverageGamesByLevelResponseSchema.parse({
//         englishLevel: level,
//         averageGamesPlayed: 0,
//         userCount: 0,
//         range: {
//           start: start.toISOString(),
//           end: end.toISOString(),
//         },
//         period,
//       });
//       res.status(200).json(response);
//       return;
//     }

//     // Count games per user for those IDs
//     const gameCounts = await prisma.game.groupBy({
//       by: ["userId"],
//       where: {
//         userId: { in: sameLevelUserIds },
//         isFinished: true,
//         startedAt: { gte: start, lte: end },
//       },
//       _count: { id: true },
//     });

//     const totalGames = gameCounts.reduce((sum, g) => sum + g._count.id, 0);
//     const average = totalGames / sameLevelUserIds.length;

//     // Return parsed response
//     const response = AverageGamesByLevelResponseSchema.parse({
//       englishLevel: level,
//       averageGamesPlayed: average,
//       userCount: sameLevelUserIds.length,
//       range: {
//         start: start.toISOString(),
//         end: end.toISOString(),
//       },
//       period,
//     });

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("❌ Error computing average:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getAverageGamesByLevelPerPeriod = async (
  req: AuthenticatedRequest,
  res: Response<AverageGamesByLevelPeerOrError>
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const period = (req.query.period as string) || "week";
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    if (!["week", "month", "year"].includes(period)) {
      res.status(400).json({ error: "Invalid period" });
      return;
    }
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date" });
      return;
    }
    let start: Date, end: Date;
    ({ start, end } = getPeriodRange(period, date));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { englishLevel: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const userLevel = user.englishLevel;
    const sameLevelUsers = await prisma.user.findMany({
      where: {
        englishLevel: userLevel,
        NOT: { id: userId },
      },
      select: { id: true },
    });
    const sameLevelUserIds = sameLevelUsers.map((u) => u.id);
    const peerCount = sameLevelUserIds.length;

    let labels: string[] = [];
    let buckets: { start: Date, end: Date }[] = [];

    if (period === "week") {
      // Each day of the week
      const days = eachDayOfInterval({ start, end });
      labels = days.map(day => format(day, "EEE").slice(0, 2));
      buckets = days.map(day => ({
        start: day,
        end: day,
      }));
    } else if (period === "month") {
      // Each week of the month
      let current = startOfWeek(start, { weekStartsOn: 0 });
      let weekIdx = 1;
      while (current <= end) {
        const weekStart = current;
        const weekEnd = endOfWeek(current, { weekStartsOn: 0 });
        buckets.push({
          start: weekStart < start ? start : weekStart,
          end: weekEnd > end ? end : weekEnd,
        });
        labels.push(`W${weekIdx++}`);
        current = addWeeks(current, 1);
      }
    } else if (period === "year") {
      // Each month of the year
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(date.getFullYear(), i, 1);
        const monthEnd = new Date(date.getFullYear(), i + 1, 0, 23, 59, 59, 999);
        buckets.push({
          start: monthStart < start ? start : monthStart,
          end: monthEnd > end ? end : monthEnd,
        });
        labels.push(format(monthStart, "MMM"));
      }
    }

    if (peerCount === 0) {
      const zeroCounts = labels.map(() => 0);
      const payload = {
        englishLevel: userLevel,
        userCount: 0,
        labels,
        counts: zeroCounts,
        period,
        range: { start: start.toISOString(), end: end.toISOString() },
      };
      const response = AverageGamesByLevelPeerPeriodResponseSchema.parse(payload);
      res.status(200).json(response as any);
      return;
    }

    // Get all peer games in the period
    const peerGames = await prisma.game.findMany({
      where: {
        userId: { in: sameLevelUserIds },
        isFinished: true,
        startedAt: { gte: start, lte: end },
      },
      select: { startedAt: true },
    });

    // Count games in each bucket
    const counts = buckets.map(({ start: bStart, end: bEnd }) => {
      const count = peerGames.filter(g =>
        g.startedAt >= bStart && g.startedAt <= bEnd
      ).length;
      return Number((count / peerCount).toFixed(2));
    });

    const payload = {
      englishLevel: userLevel,
      userCount: peerCount,
      labels,
      counts,
      period,
      range: { start: start.toISOString(), end: end.toISOString() },
    };

    const response = AverageGamesByLevelPeerPeriodResponseSchema.parse(payload);
    res.status(200).json(response as any);
  }
  catch (error: any) {
    console.error("❌ Error computing average peer games:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getUserGameStreak = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {

    // Get all finished games for this user, sorted by startedAt
    const games = await prisma.game.findMany({
      where: { userId, isFinished: true },
      orderBy: { startedAt: "asc" },
      select: { startedAt: true, gameTemplate: { select: { difficulty: true } } },
    });
    if (games.length === 0) {
      res.json({ allTime: 0, currentLevel: 0, highestLevelStreak: 0 });
      return;
    }
    function getMaxStreak(dates: Date[]) {
      if (dates.length === 0) return 0;
      let maxStreak = 1, curStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = startOfDay(dates[i - 1]);
        const curr = startOfDay(dates[i]);
        if (isSameDay(addDays(prev, 1), curr)) {
          curStreak++;
        } else if (!isSameDay(prev, curr)) {
          curStreak = 1;
        }
        if (curStreak > maxStreak) maxStreak = curStreak;
      }
      return maxStreak;
    }

    // All-time streak
    const allDates = Array.from(new Set(games.map(g => startOfDay(g.startedAt))));
    allDates.sort((a, b) => a.getTime() - b.getTime());
    const allTime = getMaxStreak(allDates);


    // Current level streak
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { englishLevel: true } });
    const currentLevel = user?.englishLevel;
    const levelDates = Array.from(
      new Set(
        games.filter(g => g.gameTemplate.difficulty === currentLevel).map(g => startOfDay(g.startedAt))
      )
    );
    levelDates.sort((a, b) => a.getTime() - b.getTime());
    const currentLevelStreak = getMaxStreak(levelDates);





    const usersAtLevel = await prisma.user.findMany({
      where: { englishLevel: currentLevel },
      select: { id: true },
    });
    let highestLevelStreak = 0;
    for (const u of usersAtLevel) {
      const userGames = await prisma.game.findMany({
        where: { userId: u.id, isFinished: true },
        orderBy: { startedAt: "asc" },
        select: { startedAt: true, gameTemplate: { select: { difficulty: true } } },
      });
      const userDates = Array.from(
        new Set(
          userGames.filter(g => g.gameTemplate.difficulty === currentLevel).map(g => startOfDay(g.startedAt))
        )
      );
      userDates.sort((a, b) => a.getTime() - b.getTime());
      const streak = getMaxStreak(userDates);
      if (streak > highestLevelStreak) highestLevelStreak = streak;
    }

    res.json({
      allTime: allTime,
      currentLevel: currentLevelStreak,
      highestStreakInThisLevel: highestLevelStreak,
    });
  }
  catch (error: any) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}