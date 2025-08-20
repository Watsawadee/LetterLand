import { getUserById } from "../services/userService";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../configs/db";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/type";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from "../types/auth.schema";


export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const user = await getUserById(userId);

    res.status(200).json({
      message: "Get user successfully",
      data: user,
    });
  } catch (error) {
    console.error("User Controller error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};

export const createUserController = async (
  req: Request,
  res: Response

) => {
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


    const token = jwt.sign({ userId: user.id, email: user.email, username: user.username, hasCompletedSetup: !!(user.age && user.englishLevel), }, JWTtoken, {
      expiresIn: "7d",
    });
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

    res.status(201).json(safeResponse)
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
};

export const loginUserController = async (
  req: Request,
  res: Response
) => {
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
      return
    }

    const user = await prisma.user.findUnique({ where: { email: normalisedEmail } });
    if (!user) {
      res.status(401).json({ error: "Incorrect credentials" });
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Incorrect credentials" });
      return
    }
    const JWTtoken = process.env.JWT_SECRET as string;

    const token = jwt.sign({ userId: user.id, email: user.email, username: user.username, hasCompletedSetup: !!(user.age && user.englishLevel), }, JWTtoken, {
      expiresIn: "7d",
    });

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
