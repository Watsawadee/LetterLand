import { Request, Response } from "express";
import prisma from "../configs/db";

export const getUserCEFR = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
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

    res.status(200).json({ englishLevel: user.englishLevel });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
