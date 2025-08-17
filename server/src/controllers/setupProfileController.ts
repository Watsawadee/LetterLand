import { Request, Response } from "express";
import prisma from "../configs/db";
import { EnglishLevel } from "@prisma/client";
import { ErrorResponse, GetWordsOrError, GetWordsResponse, OxfordEntry, SetupProfileRequest, SetupProfileResponse } from "../types/type";
import { calculateCEFRLevelFromSelectedWords } from "../services/cefrScoreService";
import fs from "fs";
import path from "path";
import { ErrorResponseSchema, SetupProfileRequestSchema, SetupProfileResponseSchema } from "../../../shared/schemas/setup.schema";

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

export const getWords = async (req: Request, res: Response<GetWordsOrError>) => {
  try {
    const selected = pickRandom(oxfordWords, 30);
    const wordList = selected.map((e) => e.word);
    res.status(200).json({ words: wordList });
  } catch (error: any) {
    console.error("Error fetching words:", error);
    const response = { error: "Failed to fetch words" };
    return res.status(500).json(ErrorResponseSchema.parse(response));
  }
};

export const setupProfile = async (
  req: Request,
  res: Response<SetupProfileResponse>
) => {
  try {
    const parsed = SetupProfileRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Missing or invalid required field." });
    }

    const { userId, age, selectedWords }: SetupProfileRequest = parsed.data;
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
    const response: SetupProfileResponse = {
      message: "Setup completed",
      cefrLevel: predictedLevel,
      user: updatedUser,
    };

    res.status(200).json(SetupProfileResponseSchema.parse(response));
  } catch (error) {
    console.error("Setup profile error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
