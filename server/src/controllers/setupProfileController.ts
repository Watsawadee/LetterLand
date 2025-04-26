import { Request, Response } from "express";
import prisma from "../configs/db";
import { EnglishLevel } from "@prisma/client";
import { SetupProfileResponse } from "../types/setupUser";
import { calculateCEFRLevelFromSelectedWords } from "../services/cefrScoreService";
import fs from "fs";
import path from "path";

const oxfordDataPath = path.join(__dirname, "../../data/oxford3000.json");
const oxfordWords = JSON.parse(fs.readFileSync(oxfordDataPath, "utf8"));

const wordToLevelMap = new Map<string, EnglishLevel>();
oxfordWords.forEach((entry: { word: string; level: string }) => {
  wordToLevelMap.set(entry.word.toLowerCase(), entry.level as EnglishLevel);
});

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
    const mappedWords = selectedWords
      .map((word: string) => {
        const level = wordToLevelMap.get(word.toLowerCase());
        return level ? { word, level } : null;
      })
      .filter(Boolean) as { word: string; level: EnglishLevel }[];

    if (mappedWords.length === 0) {
      res
        .status(400)
        .json({
          error: "No valid CEFR levels found for selected words.",
        } as any);

      return;
    }
    const predictedLevel = calculateCEFRLevelFromSelectedWords(mappedWords);

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
