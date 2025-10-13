import { Request, Response } from "express";
import { extractData } from "../services/extractDataService";
import { generateCrosswordHints } from "../services/geminiService";
import prisma from "../configs/db";
import { CreateGameFromGeminiRequestSchema, CreateGameFromGeminiResponseSchema } from "../types/createGame.schema";
import { z } from "zod"
import { genImage } from "../services/genImageService";
import { generatePronunciation } from "../services/textToSpeechService";
import { generateGameCode } from "../services/gameCodeGenerator";
export const createGameFromGemini = async (req: Request, res: Response) => {

  const parsed = CreateGameFromGeminiRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      issues: z.treeifyError(parsed.error),
    });
    return;
  }

  const { type, userId, difficulty, gameType, timer, inputData, isPublic } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { englishLevel: true, age: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }


  const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userLevelIndex = levelOrder.indexOf(user.englishLevel.toUpperCase());
  const requestedLevelIndex = levelOrder.indexOf(difficulty.toUpperCase());

  if (requestedLevelIndex === -1) {
    res.status(400).json({ message: "Invalid difficulty level" });
    return;
  }

  // Only allow user's level or below
  if (requestedLevelIndex > userLevelIndex) {
    res.status(403).json({ message: "You can only create games at your current level or below." });
    return;
  }

  try {
    let rawInput: string | Buffer;
    if (type === "pdf") {
      if (!req.file?.buffer) {
        res.status(400).json({ message: "PDF file is missing" });
        return;
      }
      rawInput = req.file.buffer;
    } else if (type === "link" || type === "text") {
      if (!inputData) {
        res.status(400).json({ message: "Input data is missing" });
        return;
      }
      rawInput = inputData;
    } else {
      res.status(400).json({ message: "Unsupported type" });
      return;
    }

    const data = await extractData(rawInput, type);
    const extractedText = typeof data === "string" ? data : data.content;

    const geminiResult = await generateCrosswordHints(
      extractedText,
      Number(userId),
      difficulty
    );

    const createdQuestions = await Promise.all(
      geminiResult.game.questions.map((q: any) =>
        prisma.question.create({
          data: {
            name: q.question,
            answer: q.answer,
            hint: q.hint ?? "",
          },
        })
      )
    );
    const gameCode = isPublic ? await generateGameCode() : null;

    const gameTemplate = await prisma.gameTemplate.create({
      data: {
        gameTopic: geminiResult.game.gameTopic,
        difficulty: difficulty,
        isPublic: isPublic,
        ownerId: userId,
        gameCode: gameCode
      },
    });

    await Promise.all(
      createdQuestions.map((question) =>
        prisma.gameTemplateQuestion.create({
          data: {
            gameTemplateId: gameTemplate.id,
            questionId: question.id,
          },
        })
      )
    );

    const game = await prisma.game.create({
      data: {
        userId,
        gameTemplateId: gameTemplate.id,
        isHintUsed: false,
        isFinished: false,
        timer: timer ?? null,
        gameType: gameType
      },
      include: {
        gameTemplate: {
          include: {
            questions: {
              include: { question: true },
            },
          },
        },
      },
    });



    const answers = createdQuestions.map((q) => q.answer);
    const pronunciationResults = await Promise.all(
      answers.map((answer: string) => generatePronunciation(answer))
    );
    await Promise.all(
      createdQuestions.map((q, idx) =>
        prisma.question.update({
          where: { id: q.id },
          data: { audioUrl: pronunciationResults[idx]?.url },
        })
      )
    );

    let imageData = null;
    let fileName: string | null = null;
    const age = Number(user.age);
    const imageStyle = age && age >= 1 && age <= 15 ? "cartoon" : "realistic";
    console.log("User age:", age, "Image style:", imageStyle);
    //Create Game
    if (geminiResult.imagePrompt) {
      const sanitizedTopic = geminiResult.game.gameTopic.toLowerCase().replace(/\s+/g, "_");
      fileName = `image_${game.id.toString()}_${sanitizedTopic}`;
      imageData = await genImage(
        geminiResult.imagePrompt,
        imageStyle,
        "16:9",
        "5",
        game.id.toString(),
        geminiResult.game.gameTopic
      );
      await prisma.gameTemplate.update({
        where: { id: gameTemplate.id },
        data: { imageUrl: fileName },
      });
    }

    const questionsWithPronunciation = game.gameTemplate.questions.map((gtq: any, idx: number) => ({
      id: gtq.question.id,
      name: gtq.question.name,
      answer: gtq.question.answer,
      hint: gtq.question.hint,
      pronunciationUrl: pronunciationResults[idx]?.url,

    }));

    const result = CreateGameFromGeminiResponseSchema.safeParse({
      message: "Game created successfully from Gemini",
      game: {
        ...game,
        gameCode: game.gameTemplate.gameCode, // <-- Add this line
        imagePrompt: geminiResult.imagePrompt,
        image: imageData,
        gameTemplate: {
          ...game.gameTemplate,
          questions: questionsWithPronunciation,
        },
      },
    });


    if (!result.success) {
      console.error("Response validation error:", z.treeifyError(result.error));
      res.status(500).json({
        message: "Invalid response format",
        issues: z.treeifyError(result.error),
      });
      return;
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
