import { Request, Response } from "express";
import { extractData } from "../services/extractDataService";
import { generateCrosswordHints } from "../services/geminiService";
import prisma from "../configs/db";
import { CreateGameFromGeminiRequestSchema, CreateGameFromGeminiResponseSchema } from "../types/createGame.schema";
import { z } from "zod"
import { genImage } from "../services/genImageService";
import { generatePronunciation } from "../services/textToSpeechService";
export const createGameFromGemini = async (req: Request, res: Response) => {
  const parsed = CreateGameFromGeminiRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      issues: z.treeifyError(parsed.error),
    });
    return;
  }

  const { type, userId, difficulty, gameType, timer, inputData, isPublic } = parsed.data;

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

    const gameTemplate = await prisma.gameTemplate.create({
      data: {
        gameTopic: geminiResult.game.gameTopic,
        gameType: gameType,
        difficulty: difficulty,
        isPublic: isPublic,
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

    let imageData = null;
    let fileName: string | null = null;

    const answers = geminiResult.game.questions.map((q: any) => q.answer);
    console.log("answer", answers)
    const pronunciationResults = await Promise.all(
      answers.map((answer: string) => generatePronunciation(answer))
    );
    await Promise.all(
      game.gameTemplate.questions.map((q: any, idx: number) =>
        prisma.question.update({
          where: { id: q.id },
          data: { audioUrl: pronunciationResults[idx]?.url },
        })
      )
    );



    // if (geminiResult.imagePrompt) {
    //   const sanitizedTopic = geminiResult.game.gameTopic.toLowerCase().replace(/\s+/g, "_");
    //   fileName = `image_${game.id.toString()}_${sanitizedTopic}`;
    //   imageData = await genImage(
    //     geminiResult.imagePrompt,
    //     "realistic",
    //     "16:9",
    //     "5",
    //     game.id.toString(),
    //     geminiResult.game.gameTopic
    //   );
    //   await prisma.gameTemplate.update({
    //     where: { id: gameTemplate.id },
    //     data: { imageUrl: fileName },
    //   });
    // }

    const questionsWithPronunciation = game.gameTemplate.questions.map((q: any, idx: number) => ({
      id: q.id,
      name: q.name,
      answer: q.answer,
      hint: q.hint,
      pronunciationUrl: pronunciationResults[idx]?.url,
    }));

    const result = CreateGameFromGeminiResponseSchema.safeParse({
      message: "Game created successfully from Gemini",
      game: {
        ...game,
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
