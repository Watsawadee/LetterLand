import prisma from "../configs/db";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, startOfDay, isSameDay, addDays, subWeeks, startOfMonth, subMonths, startOfYear, subYears, subSeconds, differenceInMinutes } from "date-fns";
import {
  TotalPlaytimeResponseSchema,
  WordsLearnedResponseSchema,
  GamesPlayedMultiplePeriodResponseSchema,
  UserProgressResponseSchema,
  AverageGamesByLevelPeerMultiplePeriodResponseSchema,
} from "../types/dashboard.schema";
import {
  TotalPlaytimeOrError, WordsLearnedOrError,
  GamesPlayedMultiplePeriodOrError,
  AverageGamesByLevelPeerMultipleOrError,
} from "../types/type"
import { EnglishLevel } from "@prisma/client";
import { getPeriodRange } from "../services/getPeriodRange";
import { secondsBetween, startOfISOWeekUTC } from "../services/levelupService";
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

export const getUserGamesPlayedMultiplePeriod = async (
  req: AuthenticatedRequest,
  res: Response<GamesPlayedMultiplePeriodOrError>
): Promise<void> => {
  const userId = Number(req.params.userId);
  const loggedInUserId = req.user?.id;
  if (userId !== loggedInUserId) {
    res.status(403).json({ error: "Forbidden: Data cant be accessed" });
    return;
  }
  const period = (req.query.period as string) || "week";
  const dateStr = req.query.date as string | undefined;
  const date = dateStr ? new Date(dateStr) : new Date();
  if (!["week", "month", "year"].includes(period)) {
    res.status(400).json({ error: "Invalid period" });
    return;
  }
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: "Invalid date" });
    return;
  }
  let dates: Date[] = [];
  const now = date; // Use selected date, not always new Date()
  if (period === "week") {
    for (let i = 0; i < 5; i++) {
      dates.push(startOfWeek(subWeeks(now, i), { weekStartsOn: 0 }));
    }
  } else if (period === "month") {
    for (let i = 0; i < 5; i++) {
      dates.push(startOfMonth(subMonths(now, i)));
    }
  } else if (period === "year") {
    for (let i = 0; i < 5; i++) {
      dates.push(startOfYear(subYears(now, i)));
    }
  }
  try {
    const results = await Promise.all(
      dates.map(async (dateStr) => {
        const date = new Date(dateStr);
        let start: Date, end: Date;
        try {
          ({ start, end } = getPeriodRange(period, date));
        } catch {
          return null;
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
          start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
          end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
          const days = eachDayOfInterval({ start, end });
          labels = days.map(day => format(day, "EEE").slice(0, 2));
          const bucket: Record<string, number> = Object.fromEntries(labels.map(l => [l, 0]));
          games.forEach(g => {
            const localDay = new Date(g.startedAt.getFullYear(), g.startedAt.getMonth(), g.startedAt.getDate(), 0, 0, 0, 0);
            const key = format(localDay, "EEE").slice(0, 2);
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
        return {
          labels,
          counts,
          range: { start: start.toISOString(), end: end.toISOString() },
          period,
          date: date.toISOString(),
        };
      })
    );

    const response = GamesPlayedMultiplePeriodResponseSchema.parse({ results: results.filter(Boolean) });
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
  res: Response<AverageGamesByLevelPeerMultipleOrError>
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

    // Build last 5 periods (current + 4 previous)
    let dates: Date[] = [];
    if (period === "week") {
      for (let i = 0; i < 5; i++) {
        dates.push(startOfWeek(subWeeks(date, i), { weekStartsOn: 0 }));
      }
    } else if (period === "month") {
      for (let i = 0; i < 5; i++) {
        dates.push(startOfMonth(subMonths(date, i)));
      }
    } else if (period === "year") {
      for (let i = 0; i < 5; i++) {
        dates.push(startOfYear(subYears(date, i)));
      }
    }

    const results = await Promise.all(
      dates.map(async (periodDate) => {
        let start: Date, end: Date;
        ({ start, end } = getPeriodRange(period, periodDate));
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0); // Local midnight
        end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);   // Local end of day
        let labels: string[] = [];
        let buckets: { start: Date, end: Date }[] = [];
        if (period === "week") {
          const days = eachDayOfInterval({ start, end });
          labels = days.map(day => format(day, "EEE").slice(0, 2));
          buckets = days.map(day => ({
            start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0), // local midnight
            end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999), // local end of day
          }));
        } else if (period === "month") {
          let current = start;
          let weekIdx = 1;
          while (current <= end) {
            const weekStart = current;
            const weekEnd = addDays(weekStart, 6);
            buckets.push({
              start: weekStart,
              end: weekEnd > end ? end : weekEnd,
            });
            labels.push(`W${weekIdx++}`);
            current = addDays(weekEnd, 1);
          }
        } else if (period === "year") {
          for (let i = 0; i < 12; i++) {
            const monthStart = new Date(periodDate.getFullYear(), i, 1);
            const monthEnd = new Date(periodDate.getFullYear(), i + 1, 0, 23, 59, 59, 999);
            buckets.push({
              start: monthStart < start ? start : monthStart,
              end: monthEnd > end ? end : monthEnd,
            });
            labels.push(format(monthStart, "MMM"));
          }
        }

        let counts: number[] = [];
        if (peerCount === 0) {
          counts = labels.map(() => 0);
        } else {
          const peerGames = await prisma.game.findMany({
            where: {
              userId: { in: sameLevelUserIds },
              isFinished: true,
              startedAt: { gte: start, lte: end },
            },
            select: { startedAt: true },
          });
          counts = buckets.map(({ start: bStart, end: bEnd }) => {
            const count = peerGames.filter(g =>
              g.startedAt >= bStart && g.startedAt <= bEnd
            ).length;
            return Number((count / peerCount).toFixed(2));
          });
        }
        console.log({
          period,
          localStart: start,
          utcStart: start.toISOString(),
          localEnd: end,
          utcEnd: end.toISOString(),
        });

        return {
          englishLevel: userLevel,
          userCount: peerCount,
          labels,
          counts,
          period,
          range: { start: start.toISOString(), end: end.toISOString() },
          date: periodDate.toISOString(),
        };
      })
    );

    const response = AverageGamesByLevelPeerMultiplePeriodResponseSchema.parse({ results });
    res.status(200).json(response);
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


export const getUserProgress = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { englishLevel: true, total_playtime: true } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Cumulative thresholds in hours
    const LEVEL_THRESHOLDS: Record<string, number> = {
      A1: 30 * 60 * 60,
      A2: 60 * 60 * 60,
      B1: 90 * 60 * 60,
      B2: 120 * 60 * 60,
      C1: 150 * 60 * 60,
      C2: 180 * 60 * 60,
    };

    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const currentLevel = user.englishLevel;
    const currentIdx = levels.indexOf(currentLevel);
    const nextLevel = levels[Math.min(currentIdx + 1, levels.length - 1)];
    const requiredPlaytime = LEVEL_THRESHOLDS[currentLevel];
    const totalPlaytimeHours = user.total_playtime / 3600;
    const progress = Math.min((user.total_playtime / requiredPlaytime) * 100, 100);
    const filled = Number(progress.toFixed(2));
    const remaining = Number(Math.max(0, Math.min(100, 100 - filled)).toFixed(2));


    //Check hint used last five game
    const lastFiveGames = await prisma.game.findMany({
      where: { userId, isFinished: true, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 5,
      select: { isHintUsed: true },
    });
    const enoughGamesPlayed = lastFiveGames.length >= 5;
    const noHintsUsedRecently = enoughGamesPlayed && lastFiveGames.every(g => !g.isHintUsed);
    //Enough playtime
    const hasEnoughPlaytime = user.total_playtime >= requiredPlaytime;

    //Play current week > prev week
    const now = new Date();
    const thisWeekStart = startOfISOWeekUTC(now);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);
    const lastWeekStart = new Date(thisWeekStart.getTime());
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);


    const [lastWeekGames, thisWeekGames] = await Promise.all([
      prisma.game.findMany({
        where: {
          userId,
          isFinished: true,
          finishedAt: { not: null },
          startedAt: { gte: lastWeekStart, lte: lastWeekEnd },
        },
        select: { startedAt: true, finishedAt: true },
      }),
      prisma.game.findMany({
        where: {
          userId,
          isFinished: true,
          finishedAt: { not: null },
          startedAt: { gte: thisWeekStart, lte: now },
        },
        select: { startedAt: true, finishedAt: true },
      }),
    ]);
    const avg = (games: { startedAt: Date; finishedAt: Date | null }[]) => {
      const finished = games.filter((g) => g.finishedAt);
      if (finished.length === 0) return 0;
      const total = finished.reduce(
        (acc, g) => acc + secondsBetween(g.startedAt, g.finishedAt!),
        0
      );
      return total / finished.length;
    };

    const avgLastWeek = avg(lastWeekGames);
    const avgThisWeek = avg(thisWeekGames);
    const avgThisWeekCount = thisWeekGames.filter(g => g.finishedAt).length;
    const hasImprovedPerformance = avgThisWeek < avgLastWeek && avgLastWeek > 0 && avgThisWeekCount > 0;

    const summary: string[] = [];
    if (!hasEnoughPlaytime) {
      summary.push(`You need more playtime to reach ${nextLevel}.`);
    }
    if (!noHintsUsedRecently) {
      summary.push("You must not use hints in your last 5 games.");
    }
    if (!enoughGamesPlayed) {
      summary.push("You must finish at least 5 games.");
    }
    if (!hasImprovedPerformance) {
      summary.push("Your performance this week must exceed last week.");
    }
    if (summary.length === 0) {
      summary.push(`You are ready to advance to ${nextLevel}!`);
    }
    const response = UserProgressResponseSchema.parse({
      englishLevel: currentLevel,
      progress: filled,
      criteria: {
        hasImprovedPerformance,
        noHintsUsedRecently,
        hasEnoughPlaytime,
      },
      summary,
      donut: {
        filled,
        remaining,
      },
    });

    res.status(200).json(response);
  }
  catch (error: any) {
    console.error("getUserProgress error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
