import { Request, Response } from "express";
import { extractData } from "../services/extractDataService";
import { generateCrosswordHints } from "../services/geminiService";
import prisma from "../configs/db";
import { CreateGameFromGeminiRequestSchema, CreateGameFromGeminiResponseSchema } from "../types/createGame.schema";
import { z } from "zod"
export const createGameFromGemini = async (req: Request, res: Response) => {
  const parsed = CreateGameFromGeminiRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      issues: z.treeifyError(parsed.error),
    });
  }

  const { type, userId, difficulty, gameType, timer, inputData } = parsed.data;

  try {
    let rawInput: string | Buffer;
    if (type === "pdf") {
      if (!req.file?.buffer) {
        return res.status(400).json({ message: "PDF file is missing" });
      }
      rawInput = req.file.buffer;
    } else if (type === "link" || type === "text") {
      if (!inputData) {
        return res.status(400).json({ message: "Input data is missing" });
      }
      rawInput = inputData;
    } else {
      return res.status(400).json({ message: "Unsupported type" });
    }

    const data = await extractData(rawInput, type);
    const extractedText = typeof data === "string" ? data : data.content;

    const geminiResult = await generateCrosswordHints(
      extractedText,
      Number(userId),
      difficulty
    );

    const gameTemplate = await prisma.gameTemplate.create({
      data: {
        gameTopic: geminiResult.game.topic,
        gameType: gameType,
        difficulty: difficulty,
        isPublic: false,
        questions: {
          create: geminiResult.game.questions.map((q: any) => ({
            name: q.question,
            answer: q.answer,
            hint: q.hint ?? "",
          })),
        },
      },
    });

    const game = await prisma.game.create({
      data: {
        userId,
        gameTemplateId: gameTemplate.id,
        isHintUsed: false,
        isFinished: false,
      },
      include: {
        gameTemplate: {
          include: { questions: true },
        },
      },
    });
    const result = CreateGameFromGeminiResponseSchema.safeParse({
      message: "Game created successfully from Gemini",
      game,
    });

    if (!result.success) {
      console.error("Response validation error:", z.treeifyError(result.error));
      return res.status(500).json({
        message: "Invalid response format",
        issues: z.treeifyError(result.error),
      });
    }
    res.status(201).json(result.data);
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    res.status(500).json({
      message: "Failed to generate Gemini prompt",
      error: error.message || error,
    });
  }
};
