import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type FoundWordItem = {
  userId: number;
  wordData: {
    questionId: number;
    word: string;
    foundAt?: Date | string;
  };
};

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
    throw new Error("Failed to getGameData");
  }
};

export const getAllWordFound = async (gameId: number) => {
  try {
    const wordFound = prisma.wordFound.findMany({
      where: { gameId },
      include: {
        question: true,
        // user: { select: { id: true, username: true } }, // if you need it
      },
      orderBy: { foundAt: "asc" },
    });
    return wordFound;
  } catch (err) {
    console.error("Error Game service:", err);
    throw new Error("Failed to getAllWordFound");
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
        userId,
        gameId,
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

export const batchRecordFoundWords = async (
  gameId: number,
  foundWords: FoundWordItem[]
) => {
  if (!Number.isFinite(gameId)) throw new Error("Invalid gameId");

  const rows = (foundWords ?? []).map(({ userId, wordData }) => ({
    gameId,
    userId,
    questionId: Number(wordData?.questionId),
    word: String(wordData?.word ?? "")
      .trim()
      .toLowerCase(),
    foundAt: wordData?.foundAt ? new Date(wordData.foundAt) : undefined,
  }));

  const clean = rows.filter(
    (r) => Number.isFinite(r.userId) && Number.isFinite(r.questionId) && r.word
  );
  if (!clean.length) return { count: 0 };

  return prisma.wordFound.createMany({
    data: clean,
    skipDuplicates: true,
  });
};