import {
  getAllGame,
  getAllGameByUserId,
  getGameData,
  recordFoundWord,
  getCorrectAnswerById,
  batchRecordFoundWords,
  recordExtraWord,
  getAllWordFound,
  completeGame,
  deleteIncompleteGame,
} from "../services/gameService";
import { generatePronunciation } from "../services/textToSpeechService";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllGameController = async (req: Request, res: Response) => {
  try {
    const game = await getAllGame();

    res.status(200).json({
      message: "Get Game successfully",
      data: game,
    });
  } catch (error) {
    console.error("Game Controller error:", error);
    res.status(500).json({ message: "Failed to get game" });
  }
};

export const getAllGameByUserIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.userId);
    const game = await getAllGameByUserId(userId);

    res.status(200).json({
      message: "Get Game successfully",
      data: game,
    });
  } catch (error) {
    console.error("Game Controller error:", error);
    res.status(500).json({ message: "Failed to get game" });
  }
};

export const getGameDataController = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.gameId);
    const game = await getGameData(gameId);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    res.status(200).json({
      message: "Get Game successfully",
      data: { game },
    });
  } catch (error) {
    console.error("Game Controller error:", error);
    res.status(500).json({ message: "Failed to get game" });
  }
};

export const getWordFoundController = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.gameId);
    const game = await getAllWordFound(gameId);

    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    res.status(200).json({
      message: "Get WordFound successfully",
      data: { game },
    });
  } catch (error) {
    console.error("WordFound Controller error:", error);
    res.status(500).json({ message: "Failed to get WordFound" });
  }
};

export const recordFoundWordController = async (
  req: Request,
  res: Response
) => {
  try {
    const gameId = Number(req.params.gameId);
    const { userId, questionId, word } = req.body;

    if (!Number.isFinite(gameId) || !userId || !questionId || !word) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const gameData = await getGameData(gameId);
    const gameTemplateId = Number(gameData?.gameTemplateId);
    if (!gameTemplateId) {
      res.status(400).json({ message: "Can't get gameTemplateId" });
      return;
    }

    const question = await getCorrectAnswerById(gameTemplateId, questionId);
    if (!question) {
      res.status(400).json({ message: "Question not found" });
      return;
    }

    const normalizedWord = String(word).trim().toLowerCase();
    if (question.answer.toLowerCase() !== normalizedWord) {
      res.status(400).json({ message: "Word does not match the answer" });
      return;
    }

    const existing = await prisma.wordFound.findFirst({
      where: {
        gameId,
        userId: Number(userId),
        questionId: Number(questionId),
        word: { equals: normalizedWord, mode: "insensitive" },
      },
    });

    if (existing) {
      res.status(200).json({
        message: "Word already recorded",
        alreadyRecorded: true,
        data: existing,
      });
      return;
    }

    const result = await recordFoundWord({
      gameId,
      userId: Number(userId),
      questionId: Number(questionId),
      word: normalizedWord,
    });

    res.status(201).json({
      message: "Word recorded successfully",
      alreadyRecorded: false,
      data: result,
    });
  } catch (error) {
    console.error("Record Found Word Controller error:", error);
    res.status(500).json({ message: "Failed to record found word" });
  }
};

export const batchRecordFoundWordsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { foundWords } = req.body;
    const gameId = Number(req.params.gameId);

    if (!Number.isFinite(gameId) || !Array.isArray(foundWords)) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }

    const gameData = await getGameData(gameId);
    const gameTemplateId = Number(gameData?.gameTemplateId);
    if (!gameTemplateId) {
      res.status(400).json({ message: "Can't get gameTemplateId" });
      return;
    }

    const normalizedItems: Array<{
      userId: number;
      wordData: { questionId: number; word: string; foundAt?: string | Date };
    }> = [];

    for (const entry of foundWords) {
      const { userId, wordData } = entry ?? {};
      const { questionId, word, foundAt } = wordData ?? {};

      if (!userId || !questionId || !word) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const q = await getCorrectAnswerById(gameTemplateId, Number(questionId));
      if (!q) {
        res.status(400).json({ message: `Question not found: ${questionId}` });
        return;
      }

      const normalizedWord = String(word).trim().toLowerCase();
      if (q.answer.toLowerCase() !== normalizedWord) {
        res.status(400).json({
          message: `Word does not match the answer for questionId ${questionId}`,
        });
        return;
      }

      normalizedItems.push({
        userId: Number(userId),
        wordData: {
          questionId: Number(questionId),
          word: normalizedWord,
          foundAt,
        },
      });
    }

    if (!normalizedItems.length) {
      res.status(200).json({
        message: "No items to record",
        data: { inserted: 0, skipped: 0, total: 0 },
      });
      return;
    }

    const { inserted, skipped, total } = await batchRecordFoundWords(
      gameId,
      normalizedItems
    );

    res.status(inserted ? 201 : 200).json({
      message: inserted ? "Batch recorded" : "No new words to record",
      data: { inserted, skipped, total },
    });
  } catch (err) {
    console.error("Batch record error:", err);
    res.status(500).json({ message: "Batch record failed" });
  }
};

const COIN_PER_EXTRA_WORD = 1;

export const recordExtraWordController = async (
  req: Request,
  res: Response
) => {
  try {
    const gameId = Number(req.params.gameId);
    const { userId, word } = req.body ?? {};

    if (!Number.isFinite(gameId)) {
      res.status(400).json({ message: "Invalid gameId" });
      return;
    }
    if (!Number.isFinite(Number(userId))) {
      res.status(400).json({ message: "Invalid userId" });
      return;
    }
    if (typeof word !== "string" || !word.trim()) {
      res.status(400).json({ message: "Invalid word" });
      return;
    }

    let audioUrl: string | undefined;
    try {
      const resPron = await generatePronunciation(
        String(word).trim().toLowerCase()
      );
      if (
        resPron &&
        typeof resPron.url === "string" &&
        resPron.url.length > 0
      ) {
        audioUrl = resPron.url;
      }
    } catch (e) {
      console.warn(
        "generate Pronunciation failed, proceeding without audioUrl:",
        e
      );
    }

    const result = await recordExtraWord(
      gameId,
      Number(userId),
      word,
      audioUrl
    );
    res.status(200).json({
      created: result.created,
      totalExtra: result.totalExtra,
      coinsAwarded: result.coinsAwarded,
      newCoinBalance: result.newCoinBalance,
      alreadyCounted: result.alreadyCounted,
    });
  } catch (err) {
    console.error("Extraword controller error:", err);
    res.status(500).json({ message: "Extraword controller failed" });
  }
};

export const completeGameController = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.gameId);

    const {
      userId,
      completed,
      finishedOnTime,
      timeUsedSeconds,
    }: {
      userId: number;
      completed?: boolean;
      finishedOnTime?: boolean;
      timeUsedSeconds?: number;
    } = req.body ?? {};

    const result = await completeGame({
      gameId,
      userId,
      completed,
      finishedOnTime,
      timeUsedSeconds,
    });

    if (result.alreadyFinished && !result.updatedGame) {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, coin: true, total_playtime: true },
      });

      res.status(200).json({
        message: "Game already completed",
        data: {
          id: gameId,
          userId: Number(userId),
          isFinished: true,
          user,
        },
        coinsAwarded: 0,
        secondsAdded: 0,
        userTotalPlaytime: user?.total_playtime,
      });
      return;
    }

    res.status(200).json({
      message: completed ? "Complete Game recorded" : "Game updated",
      data: result.updatedGame,
      coinsAwarded: result.coinsAwarded,
      secondsAdded: result.secondsAdded,
      userTotalPlaytime: result.updatedGame?.user?.total_playtime,
    });
  } catch (err) {
    console.error("Error in complete Game Controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteIncompleteGameController = async (
  req: Request,
  res: Response
) => {
  const gameId = Number(req.params.gameId);
  const userId = Number(req.body.userId);

  const result = await deleteIncompleteGame(gameId, userId);

  if (!result.ok) {
    const msg = result.message || "Failed";
    if (msg.includes("Invalid")) {
      res.status(400).json({ message: msg });
      return;
    }
    if (msg.includes("not found")) {
      res.status(404).json({ message: msg });
      return;
    }
    if (msg.includes("permission")) {
      res.status(403).json({ message: msg });
      return;
    }
    if (msg.includes("Finished")) {
      res.status(409).json({ message: msg });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  res.status(200).json({ message: "Delete complete", data: result.data });
};
