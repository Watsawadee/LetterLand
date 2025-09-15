import { Request, Response } from "express";
import prisma from "../configs/db";
import { EnglishLevel } from "@prisma/client";
import { ErrorResponse, GetWordsOrError, GetWordsResponse, SetupProfileRequest, SetupProfileResponse, vocabEntry } from "../types/type";
import { calculateCEFRLevelFromSelectedWords } from "../services/cefrScoreService";
import fs from "fs";
import path from "path";
import { ErrorResponseSchema, SetupProfileRequestSchema, SetupProfileResponseSchema, vocabEntrySchema } from "../types/setup.schema";

const vocabDataPath = path.join(__dirname, "../../data/ENGLISHWORDSCERFLABELLED.json");
const vocabWords: vocabEntry[] = JSON.parse(
  fs.readFileSync(vocabDataPath, "utf8")
);

const headwordToLevelMap = new Map<string, EnglishLevel>();
for (const entry of vocabWords) {
  if (typeof entry.headword !== "string") continue;
  const variants = entry.headword.split("/").map((w) => w.trim().toLowerCase());
  for (const v of variants) {
    headwordToLevelMap.set(v, entry.CEFR);
  }
}
function pickRandom(words: vocabEntry[], count: number): vocabEntry[] {
  const levels: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const grouped: Record<EnglishLevel, vocabEntry[]> = {
    A1: [], A2: [], B1: [], B2: [], C1: [], C2: []
  };
  for (const w of words) grouped[w.CEFR].push(w);

  const perLevel = Math.floor(count / levels.length);
  let remainder = count % levels.length;

  const result: vocabEntry[] = [];

  for (const level of levels) {
    const group = grouped[level];
    if (group.length === 0) continue;

    const toTake = Math.min(perLevel + (remainder > 0 ? 1 : 0), group.length);
    if (remainder > 0) remainder--;

    const shuffled = group.slice().sort(() => Math.random() - 0.5);
    result.push(...shuffled.slice(0, toTake));
  }

  return result;
}


export const getWords = async (req: Request, res: Response) => {
  try {
    const selected = pickRandom(vocabWords, 30);
    console.log(
      "Randomly selected words with CEFR:",
      selected.map((e) => `${e.headword} (${e.CEFR})`)
    );

    const headwords = selected.map((e) => e.headword);
    res.status(200).json({ headwords });
  } catch (error: any) {
    console.error("Error fetching words:", error);

    const response = { error: "Failed to fetch words" };
    const parsed = ErrorResponseSchema.safeParse(response);
    if (parsed.success) {
      res.status(500).json(parsed.data);
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
};

export const setupProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = SetupProfileRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Missing or invalid required field." });
      return
    }

    const { userId, age, selectedHeadwords }: SetupProfileRequest = parsed.data;
    const mappedWords = selectedHeadwords
      .map((hw: string) => {
        const level = headwordToLevelMap.get(hw.toLowerCase());
        return level ? { headword: hw, CEFR: level } : null;
      })
      .filter((v): v is vocabEntry => v !== null);
    if (mappedWords.length === 0) {
      res.status(400).json({
        error: "No valid CEFR levels found for selected headwords.",
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
