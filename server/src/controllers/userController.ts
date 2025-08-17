import { getUserById } from "../services/userService";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../configs/db";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/type";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from "../../../shared/schemas/auth.schema";

const JWTtoken = process.env.JWT_SECRET as string;
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
      return res.status(400).json({ error: parsed.error.format() });
    }

    const { email, username, password }: RegisterRequest = parsed.data;
    const normalisedEmail = email.toLowerCase();
    const existedUser = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (existedUser) {
      throw new Error("User account is already existed")
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

    const token = jwt.sign({ userId: user.id }, JWTtoken, {
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

    return res.status(201).json(safeResponse)
  } catch (error) {
    console.error("Create user error:", error);
    throw new Error("Failed to create account")
  }
};

export const loginUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = LoginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }
    const { email, password }: LoginRequest = parsed.data;
    const normalisedEmail = email.toLowerCase();

    if (!normalisedEmail || !password) {
      throw new Error("Incorrect credential")
    }

    const user = await prisma.user.findUnique({ where: { email: normalisedEmail } });
    if (!user) {
      return res.status(401).json({ error: "Incorrect credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect credential")
    }

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
    return res.status(200).json(safeResponse);

  } catch (error) {
    throw new Error("Incorrect Credential")
  }
};
