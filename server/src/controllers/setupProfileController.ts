import { Request, Response } from "express";
import prisma from "../configs/db";
import { getCEFRLevelFromGemini } from "../services/geminiService";
import { EnglishLevel } from "@prisma/client";
export const setupProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, age, selectedWords } = req.body;
    if (!userId || !age || !Array.isArray(selectedWords)) {
      return res.status(400).json({ error: "Missing required field" });
    }
    const predictedLevel = await getCEFRLevelFromGemini(selectedWords);

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
    res.status(500).json({ error: "Internal Server Error" });
  }
};
