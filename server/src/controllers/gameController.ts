import {
  getAllGame,
  getAllGameByUserId,
  getGameData,
  recordFoundWord,
  getCorrectAnswerById,
  batchRecordFoundWords,
  getAllWordFound,
  completeGame,
} from "../services/gameService";
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

    if (!userId || !questionId || !word) {
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

    if (question.answer.toLowerCase() !== word.toLowerCase()) {
      res.status(400).json({ message: "Word does not match the answer" });
      return;
    }

    const result = await recordFoundWord({
      gameId,
      userId,
      questionId,
      word,
    });

    res.status(201).json({
      message: "Word recorded successfully",
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
    const { gameId } = req.params;

    if (!Array.isArray(foundWords)) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }

    for (const entry of foundWords) {
      const { userId, wordData } = entry;
      const { questionId, word } = wordData;

      if (!userId || !questionId || !word) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const gameData = await getGameData(Number(gameId));
      const gameTemplateId = Number(gameData?.gameTemplateId);
      if (!gameTemplateId) {
        res.status(400).json({ message: "Can't get gameTemplateId" });
        return;
      }

      const question = await getCorrectAnswerById(gameTemplateId, questionId);

      console.info("question", question);
      if (!question) {
        res.status(400).json({ message: "Question not found" });
        return;
      }

      if (question.answer.toLowerCase() !== word.toLowerCase()) {
        res.status(400).json({ message: "Word does not match the answer" });
        return;
      }
    }

    const result = await batchRecordFoundWords(Number(gameId), foundWords);
    res.status(201).json({ message: "Batch recorded", data: result });
  } catch (err) {
    console.error("Batch record error:", err);
    res.status(500).json({ message: "Batch record failed" });
  }
};

export const completeGameController = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.gameId);
    const {
      userId,
      completed,
      finishedOnTime,
      isHintUsed,
      timeUsedSeconds,
    } = (req.body ?? {}) as {
      userId?: number;
      completed?: boolean;
      finishedOnTime?: boolean;
      isHintUsed?: boolean;
      timeUsedSeconds?: number;
    };

    const result = await completeGame({
      gameId,
      userId: Number(userId),
      completed,
      finishedOnTime,
      isHintUsed,
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
      });
      return;
    }

    res.status(200).json({
      message: "Complete Game recorded",
      data: result.updatedGame,
      coinsAwarded: result.coinsAwarded,
    });
  } catch (err) {
    console.error("Error in complete Game Controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
