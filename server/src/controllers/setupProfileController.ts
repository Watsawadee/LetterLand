import { Request, Response } from "express";
import prisma from "../configs/db";
import { EnglishLevel } from "@prisma/client";
import { SetupProfileResponse } from "../types/setupUser";
import { calculateCEFRLevelFromSelectedWords } from "../services/cefrScoreService";

export const setupProfile = async (
  req: Request,
  res: Response<SetupProfileResponse>
): Promise<void> => {
  try {
    const { userId, age, selectedWords } = req.body;
    if (!userId || !age || !Array.isArray(selectedWords)) {
      res.status(400).json({ error: "Missing required field" } as any);
      return;
    }

    const predictedLevel = calculateCEFRLevelFromSelectedWords(selectedWords);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        age: Number(age),
        englishLevel: predictedLevel as EnglishLevel,
      },
    });

    res.status(200).json({
      message: "Setup completed",
      cefrLevel: predictedLevel,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Setup profile error: ", error);
    res.status(500).json({ error: "Internal Server Error" } as any);
  }
};
