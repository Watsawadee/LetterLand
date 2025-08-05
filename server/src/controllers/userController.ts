import { getUserById } from "../services/userService";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../configs/db";
import { CreateUserRequest, CreateUserResponse } from "../types/createUser";
import { LoginRequestBody, LoginResponse } from "../types/loginUser";
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
  req: CreateUserRequest

): Promise<CreateUserResponse> => {
  try {
    const { email, username, password } = req;
    if (!email || !username || !password) {
      // return res.status(400).json({ error: "Please fill in all fields" });
      throw new Error("Please Fill in All Fields")
    }
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
    return {
      message: "Successfully created user",
      user,
      token,
    }
  } catch (error) {
    console.error("Create user error:", error);
    throw new Error("Failed to create account")
  }
};

export const loginUserController = async (
  req: LoginRequestBody,
): Promise<LoginResponse> => {
  try {
    const { email, password } = req;
    const normalisedEmail = email.toLowerCase();

    if (!normalisedEmail || !password) {
      throw new Error("Incorrect credential")
    }

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (!user) {
      throw new Error("Incorrect credential")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect credential")
    }

    const token = jwt.sign({ userId: user.id, email: user.email, username: user.username, hasCompletedSetup: !!(user.age && user.englishLevel), }, JWTtoken, {
      expiresIn: "7d",
    });
    // res.status(200).json({
    //   message: "LoggedIn Successfully",
    //   token,
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //     username: user.username,
    //     age: user.age,
    //     hasCompletedSetup: !!(user.age && user.englishLevel),
    //   },
    // });
    return {
      message: "LoggedIn Successfully",
      token,
      user: {
        age: user.age,
        englishLevel: user.englishLevel,
        coin: user.coin,
        hint: user.hint,
        created_at: user.created_at.toISOString(),
        total_playtime: user.total_playtime,
      },
    }

  } catch (error) {
    throw new Error("Incorrect Credential")
  }
};
