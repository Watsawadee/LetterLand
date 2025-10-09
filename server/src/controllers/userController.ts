import {
  getAllUser,
  getUserById,
  useHint,
  buyHint,
} from "../services/userService";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../configs/db";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/type";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
} from "../types/auth.schema";
import {
  getNextLevel,
  secondsBetween,
  startOfISOWeekUTC,
} from "../services/levelupService";
import { ProgressLevelupResponseSchema } from "../types/progressLevelup.schema";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { EnglishLevel } from "../types/setup.schema";

export const getAllUserController = async (req: Request, res: Response) => {
  try {
    const user = await getAllUser();

    res.status(200).json({
      message: "Get User successfully",
      data: user,
    });
  } catch (error) {
    console.error("User Controller error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};
export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const nextLevel = getNextLevel(user.englishLevel);
    let canLevelUp = false;
    if (nextLevel && user.total_playtime >= 200 * 60 * 60) {
      canLevelUp = true;
    }
    res.status(200).json({
      message: "Get user successfully",
      data: { ...user, nextLevel, canLevelUp },
    });
  } catch (error) {
    console.error("User Controller error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    const { email, username, password }: RegisterRequest = parsed.data;
    const normalisedEmail = email.toLowerCase();
    const existedUser = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (existedUser) {
      res.status(409).json({ message: "User account already exists" });
      return;
    }
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        email: normalisedEmail,
        username,
        password: hashedPassword,
        age: 0,
        englishLevel: "A1",
      },
    });
    const JWTtoken = process.env.JWT_SECRET as string;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        hasCompletedSetup: !!(user.age && user.englishLevel),
      },
      JWTtoken,
      {
        expiresIn: "7d",
      }
    );
    const response: RegisterResponse = {
      message: "Successfully created user",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        age: user.age,
        hasCompletedSetup: !!(user.age && user.englishLevel),
        englishLevel: user.englishLevel,
        coin: user.coin,
        hint: user.hint,
        created_at: user.created_at.toISOString(),
        total_playtime: user.total_playtime,
      },
      token,
    };

    const safeResponse = RegisterResponseSchema.parse(response);

    res.status(201).json(safeResponse);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const parsed = LoginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.format() });
      return;
    }
    const { email, password }: LoginRequest = parsed.data;
    const normalisedEmail = email.toLowerCase();

    if (!normalisedEmail || !password) {
      res.status(401).json({ message: "Incorrect credentials" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });
    if (!user) {
      res.status(401).json({ error: "Incorrect credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Incorrect credentials" });
      return;
    }
    const JWTtoken = process.env.JWT_SECRET as string;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        hasCompletedSetup: !!(user.age && user.englishLevel),
      },
      JWTtoken,
      {
        expiresIn: "7d",
      }
    );

    const response: LoginResponse = {
      message: "LoggedIn Successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        age: user.age,
        hasCompletedSetup: !!(user.age && user.englishLevel),
        englishLevel: user.englishLevel,
        coin: user.coin,
        hint: user.hint,
        created_at: user.created_at.toISOString(),
        total_playtime: user.total_playtime,
      },
    };
    const safeResponse = LoginResponseSchema.parse(response);
    res.status(200).json(safeResponse);
  } catch (error) {
    console.error("Login user error:", error);
    res.status(500).json({ message: "Incorrect credentials" });
  }
};

export const useHintController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const gameId = Number(req.body?.gameId);

    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }
    if (!gameId) {
      res.status(400).json({ message: "Missing gameId" });
      return;
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        userId: true,
        isFinished: true,
        isHintUsed: true,
      },
    });

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
    if (game.userId !== userId) {
      res.status(403).json({ message: "Forbidden: not your game" });
      return;
    }
    if (game.isFinished) {
      res
        .status(409)
        .json({ message: "Game is already finished; cannot use hint" });
      return;
    }

    if (game.isHintUsed) {
      res.status(200).json({
        message: "Hint already marked as used",
        data: {
          user: null,
          game: { id: game.id, isHintUsed: true },
          alreadyUsed: true,
        },
      });
      return;
    }

    const [updatedUser, updatedGame] = await prisma.$transaction(async (tx) => {
      const newUser = await useHint(userId);

      const newGame = await tx.game.update({
        where: { id: gameId },
        data: { isHintUsed: true },
        select: { id: true, isHintUsed: true },
      });

      return [newUser, newGame] as const;
    });

    res.status(200).json({
      message: "Hint used successfully",
      data: {
        user: updatedUser,
        game: updatedGame,
        alreadyUsed: false,
      },
    });
  } catch (error) {
    console.error("Use Hint Controller error:", error);
    res.status(500).json({ message: "Failed to use hint" });
  }
};

export const progressLevelupController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const TWO_HUNDRED_HOURS_SECS = 200 * 60 * 60;

  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        englishLevel: true,
        total_playtime: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const nextLevelup = getNextLevel(user.englishLevel);
    if (!nextLevelup) {
      res.status(400).json({ message: "You are already at the top level" });
      return;
    }

    const conditions: { name: string; passed: boolean; details?: any }[] = [];

    // --- 1) Last 5 games & hints ---
    const lastFiveGames = await prisma.game.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: { isHintUsed: true },
    });

    const enoughGamesPlayed = lastFiveGames.length >= 5;
    const usedAnyHints = lastFiveGames.some((g) => g.isHintUsed);

    conditions.push({
      name: "At least 5 games played",
      passed: enoughGamesPlayed,
      details: { gamesPlayed: lastFiveGames.length },
    });
    conditions.push({
      name: "No hints used in last 5 games",
      passed: !usedAnyHints,
      details: { usedAnyHints },
    });

    // --- 2) Total playtime at current level ---
    const levelGames = await prisma.game.findMany({
      where: {
        userId,
        finishedAt: { not: null },
        gameTemplate: { difficulty: user.englishLevel },
      },
      select: { startedAt: true, finishedAt: true },
    });

    const LEVEL_THRESHOLDS: Record<EnglishLevel, number> = {
      A1: 200 * 60 * 60,
      A2: 400 * 60 * 60,
      B1: 600 * 60 * 60,
      B2: 800 * 60 * 60,
      C1: 1000 * 60 * 60,
      C2: Number.POSITIVE_INFINITY,
    };
    const requiredPlaytime = LEVEL_THRESHOLDS[user.englishLevel];
    const hasEnoughPlaytime = user.total_playtime >= requiredPlaytime;

    conditions.push({
      name: "200 hours playtime on current level",
      passed: hasEnoughPlaytime,
      details: {
        requiredSeconds: TWO_HUNDRED_HOURS_SECS,
        accumulatedSeconds: user.total_playtime,
      },
    });

    // --- 3) Weekly average check ---
    const now = new Date();
    const thisWeekStart = startOfISOWeekUTC(now);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);
    const lastWeekStart = new Date(thisWeekStart.getTime());
    lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

    const [lastWeekGames, thisWeekGames] = await Promise.all([
      prisma.game.findMany({
        where: {
          userId,
          finishedAt: { not: null },
          startedAt: { gte: lastWeekStart, lte: lastWeekEnd },
        },
        select: { startedAt: true, finishedAt: true },
      }),
      prisma.game.findMany({
        where: {
          userId,
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
    const weeklyRuleOk = avgThisWeek < avgLastWeek && avgLastWeek > 0;

    conditions.push({
      name: "AvgTime_this_week < AvgTime_last_week",
      passed: weeklyRuleOk,
      details: {
        avgTimeLastWeek: Math.round(avgLastWeek),
        avgTimeThisWeek: Math.round(avgThisWeek),
      },
    });

    // --- Final check ---
    const allPassed = conditions.every((c) => c.passed);

    if (!allPassed) {
      const failResponse = {
        message: "Level up conditions not met",
        nextLevel: nextLevelup,
        canLevelUp: false,
        conditions,
      };
      res.status(400).json(failResponse);
      return;
    }

    // Update user level
    await prisma.user.update({
      where: { id: userId },
      data: { englishLevel: nextLevelup },
    });

    const response = {
      message: `Level up! New level: ${nextLevelup}`,
      nextLevel: nextLevelup,
      canLevelUp: true,
    };
    ProgressLevelupResponseSchema.parse(response);
    res.status(200).json(response);
  } catch (error) {
    console.error("ProgressLevelupController error:", error);
    res.status(500).json("Failed to levelup");
  }
};

export const buyHintController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const qty = Number(req.body?.qty);

    if (!Number.isInteger(userId)) {
      res.status(400).json({ message: "Missing or invalid userId" });
    }
    if (!Number.isInteger(qty)) {
      res.status(400).json({ message: "Missing or invalid qty" });
    }

    const updated = await buyHint(userId, qty);

    res.status(200).json({
      message: "Purchase hint successful",
      data: updated,
    });
  } catch (error: any) {
    if (error?.code === "USER_NOT_FOUND") {
      res.status(404).json({ message: "User not found" });
    }
    if (error?.code === "INVALID_QTY") {
      res.status(400).json({ message: "Invalid qty (must be 1, 3, or 5)" });
    }
    if (error?.code === "INSUFFICIENT_FUNDS") {
      res.status(400).json({ message: "Not enough coins" });
    }
    console.error("Buy Hint Controller error:", error);
    res.status(400).json({ message: "Failed to purchase hint" });
  }
};

export const getUserLastFinishedGame = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = Number(req.params.userId);
  const loggedInUserId = req.user?.id;

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  if (userId !== loggedInUserId) {
    res.status(403).json({ error: "Forbidden: Cannot access other user's data" });
    return;
  }

  try {
    const lastGame = await prisma.game.findFirst({
      where: { userId, isFinished: true },
      orderBy: { finishedAt: "desc" },
      include: {
        gameTemplate: true,
      },
    });

    if (!lastGame) {
      res.status(200).json({ message: "No finished games yet" });
      return;
    }

    res.status(200).json({
      lastFinishedGame: {
        id: lastGame.id,
        finishedAt: lastGame.finishedAt,
        topic: lastGame.gameTemplate?.gameTopic ?? "Unknown",
        type: lastGame.gameType ?? "Unknown",
        difficulty: lastGame.gameTemplate?.difficulty ?? "Unknown",
      },
    });
  } catch (error) {
    console.error("Error fetching last finished game:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

