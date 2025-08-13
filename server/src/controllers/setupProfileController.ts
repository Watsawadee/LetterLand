import { Request, Response } from "express";
import prisma from "../configs/db";
import { EnglishLevel } from "@prisma/client";
import { ErrorResponse, GetWordsResponse, OxfordEntry, SetupProfileRequestBody, SetupProfileResponse } from "../types/setupUser";
import { calculateCEFRLevelFromSelectedWords } from "../services/cefrScoreService";
import fs from "fs";
import path from "path";

const oxfordDataPath = path.join(__dirname, "../../data/oxford3000.json");
const oxfordWords: OxfordEntry[] = JSON.parse(
  fs.readFileSync(oxfordDataPath, "utf8")
);

const wordToLevelMap = new Map<string, EnglishLevel>();
for (const entry of oxfordWords) {
  wordToLevelMap.set(entry.word.toLowerCase(), entry.level);
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export const getWords = async (req: Request, res: Response<GetWordsResponse | ErrorResponse>) => {
  try {
    const selected = pickRandom(oxfordWords, 30);
    const wordList = selected.map((e) => e.word);
    res.status(200).json({ words: wordList });
  } catch (error: any) {
    console.error("Error fetching words:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
};

export const setupProfile = async (
  req: Request<unknown, SetupProfileResponse, SetupProfileRequestBody>,
  res: Response<SetupProfileResponse>
): Promise<void> => {
  try {
    const userId = Number(req.body.userId);
    const age = Number(req.body.age);
    const { selectedWords } = req.body;
    if (!Number.isFinite(userId) || !Number.isFinite(age) || !Array.isArray(selectedWords)) {
      res.status(400).json({ error: "Missing or invalid required field." });
      return;
    }
    const mappedWords = selectedWords
      .map((word) => {
        const level = wordToLevelMap.get(word.toLowerCase());
        return level ? { word, level } : null;
      })
      .filter(
        (v): v is { word: string; level: EnglishLevel } => v !== null
      );
    if (mappedWords.length === 0) {
      res.status(400).json({
        error: "No valid CEFR levels found for selected words.",
      });

      return;
    }
    const predictedLevel = calculateCEFRLevelFromSelectedWords(mappedWords);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { age, englishLevel: predictedLevel },
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
