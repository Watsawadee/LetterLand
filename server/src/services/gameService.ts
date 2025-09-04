import { PrismaClient } from "@prisma/client";
import { FoundWordInput } from "../types";
const prisma = new PrismaClient();

export const getAllGame = async () => {
  try {
    const game = await prisma.game.findMany();

    return game;
  } catch (err) {
    console.error("Error Game service:", err);
    throw new Error("Failed to getAllGame");
  }
};

export const getAllGameByUserId = async (userId: number) => {
  try {
    const user = await prisma.game.findMany({
      where: {
        userId: userId,
      },
    });

    return user;
  } catch (err) {
    console.error("Error Game service:", err);
    throw new Error("Failed to getAllGameByUserId");
  }
};

export const getGameData = async (gameId: number) => {
  try {
    const GameData = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        gameTemplate: { include: { questions: true } },
      },
    });
    return GameData;
  } catch (err) {
    console.error("Error Game service:", err);
    throw new Error("Failed to getGameByUserId");
  }
};

export const recordFoundWord = async ({
  gameId,
  userId,
  questionId,
  word,
}: {
  gameId: number;
  userId: number;
  questionId: number;
  word: string;
}) => {
  try {
    const found = await prisma.wordFound.create({
      data: {
        gameId,
        userId,
        questionId,
        word,
      },
    });
    return found;
  } catch (err) {
    console.error("Error recording found word:", err);
    throw new Error("Failed to record found word");
  }
};

export const getCorrectAnswerById = async (
  gameTemplateId: number,
  questionId: number
) => {
  try {
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        gameTemplateId: gameTemplateId,
      },
      select: {
        id: true,
        answer: true,
      },
    });

    return question;
  } catch (err) {
    console.error("Error fetching question by gameId:", err);
    throw new Error("Failed to get question");
  }
};

export const batchRecordFoundWords = async (foundWords: FoundWordInput[]) => {
  const data = foundWords.map(({ gameId, userId, wordData }) => ({
    gameId,
    userId,
    questionId: wordData.questionId,
    word: wordData.word,
    foundAt: wordData.foundAt,
  }));

  return await prisma.wordFound.createMany({
    data: data,
    skipDuplicates: true,
  });
};

