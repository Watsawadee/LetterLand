import { Request, Response } from "express";
import prisma from "../configs/db";

export const saveGameFromGemini = async (req: Request, res: Response) => {
  try {
    const { game, userId } = req.body;

    if (!game || !game.success || !game.game) {
      return res.status(400).json({ error: "Missing required game data" });
    }

    const { topic, questions } = game.game;

    if (!userId || !topic || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { englishLevel: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const createdTemplate = await prisma.gameTemplate.create({
      data: {
        gameTopic: topic,
        gameType: "CROSSWORD_SEARCH",
        difficulty: user.englishLevel,
        isPublic: false,
        questions: {
          create: questions.map((q: any) => ({
            name: q.question,
            answer: q.answer,
            hint: q.hint || "No hint provided",
          })),
        },
      },
      include: { questions: true },
    });

    const createdGame = await prisma.game.create({
      data: {
        userId,
        gameTemplateId: createdTemplate.id,
      },
    });

    res.status(201).json({
      success: true,
      game: {
        id: createdGame.id,
        topic: createdTemplate.gameTopic,
        difficulty: createdTemplate.difficulty,
        questions: createdTemplate.questions,
      },
    });
  } catch (error) {
    console.error("Failed to save game:", error);
    res.status(500).json({ error: "Failed to save game to database" });
  }
};
