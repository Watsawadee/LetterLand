import { getUserById } from "../services/userService";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../configs/db";
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
): Promise<any> => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }
    const normalisedEmail = email.toLowerCase();
    const existedUser = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (existedUser) {
      res
        .status(400)
        .json({ messsage: "User with this email is already existed" });
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

    const token = jwt.sign({ userId: user.id }, JWTtoken, {
      expiresIn: "7d",
    });
    res.status(201).json({
      message: "Successfully Create Username",
      user,
      token,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const loginUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalisedEmail = email.toLowerCase();

    if (!normalisedEmail || !password) {
      res.status(400).json({ error: "Email and Password are required !" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalisedEmail },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid Email or Password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid Email or Password" });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWTtoken, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "LoggedIn Successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        age: user.age,
        hasCompletedSetup: !!(user.age && user.englishLevel),
      },
    });
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};
