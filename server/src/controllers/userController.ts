import { getAllUser, getUserById, useHint, buyHint } from "../services/userService";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../configs/db";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/type";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from "../types/auth.schema";
import { getNextLevel } from "../services/levelupService";
import { ProgressLevelupResponseSchema } from "../types/progressLevelup.schema";
import { AuthenticatedRequest } from "../types/authenticatedRequest";


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

    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }

    const updatedUser = await useHint(userId);

    res.status(200).json({
      message: "Hint used successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Use Hint Controller error:", error);
    res.status(400).json("Failed to use hint");
  }
};


export const progressLevelupController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return;
    }
    const nextLevelup = getNextLevel(user.englishLevel);
    if (!nextLevelup) {
      res.status(400).json({ message: "You are already at the top level" })
      return;
    }
    const hasEnoughPlaytime = user.total_playtime >= 200 * 60 * 60;

    const lastFiveGames = await prisma.game.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: { isHintUsed: true }
    });

    if (lastFiveGames.length < 5) {
      res.status(400).json({ message: "Not enough games played" });
      return;
    }

    const usedAnyHints = lastFiveGames.some((g: { isHintUsed: boolean }) => g.isHintUsed === true);
    if (usedAnyHints) {
      res.status(400).json({ message: "Hints were used in last five games" });
      return;
    }

    const canLevelUp = hasEnoughPlaytime && !usedAnyHints;

    if (!canLevelUp) {
      res.status(400).json({
        message: "Level up conditions not met",
        nextLevelup,
        canLevelUp: false,
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { englishLevel: nextLevelup }
    })
    const response = { message: `Level up! New level: ${nextLevelup}`, nextLevelup };
    ProgressLevelupResponseSchema.parse(response);
    res.status(200).json(response)
  }
  catch (error) {
    console.error("ProgressLevelupController error:", error);
    res.status(500).json("Failed to levelup")
  }
}

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

