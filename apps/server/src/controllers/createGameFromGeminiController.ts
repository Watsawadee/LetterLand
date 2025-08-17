import { Request, Response } from "express";
import { extractData } from "../services/extractDataService";
import { generateCrosswordHints } from "../services/geminiService";
import prisma from "../configs/db";

export const createGameFromGemini = async (req: Request, res: Response) => {
  const { type, userId, userCEFR, gameType, timer, inputData } = req.body;

  if (!type || !userId || !userCEFR || !gameType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

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
      userCEFR
    );

    const gameTemplate = await prisma.gameTemplate.create({
      data: {
        gameTopic: geminiResult.game.topic,
        gameType: gameType,
        difficulty: userCEFR,
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

    res.status(201).json({
      message: "Game created successfully from Gemini",
      game,
    });
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    res.status(500).json({
      message: "Failed to generate Gemini prompt",
      error: error.message || error,
    });
  }
};
