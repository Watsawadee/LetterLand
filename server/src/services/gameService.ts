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

type gameCompleteInput = {
  gameId: number;
  userId: number;
  completed?: boolean;
  finishedOnTime?: boolean;
  isHintUsed?: boolean;
  timeUsedSeconds?: number;
};

type gameCompleteResult = {
  coinsAwarded: number;
  alreadyFinished: boolean;
  updatedGame?: any;
};

export async function getGameForCompletion(gameId: number) {
  return prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      userId: true,
      isFinished: true,
      isHintUsed: true,
      timer: true,
      gameTemplateId: true,
      startedAt: true,
      finishedAt: true,
      gameCode: true,
    },
  });
}

export function computeCoins(args: {
  isTimerMode: boolean;
  completed?: boolean;
  finishedOnTime?: boolean;
}): number {
  const { isTimerMode, completed, finishedOnTime } = args;
  if (isTimerMode) {
    return completed && finishedOnTime ? 70 : 0;
  }
  return completed ? 50 : 0;
}

export async function finalizeGame(opts: {
  gameId: number;
  userId: number;
  coins: number;
  extraGameData?: Record<string, any>;
  timeUsedSeconds?: number;
}) {
  const { gameId, userId, coins, extraGameData = {}, timeUsedSeconds } = opts;

  const updated = await prisma.$transaction(async (tx) => {
    const game = await tx.game.update({
      where: { id: gameId },
      data: {
        isFinished: true,
        finishedAt: new Date(),
        ...(Object.keys(extraGameData).length ? extraGameData : {}),
      },
      include: {
        user: { select: { id: true, coin: true, total_playtime: true } },
      },
    });

    if (coins > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { coin: { increment: coins } },
      });
    }

    if (typeof timeUsedSeconds === "number" && timeUsedSeconds > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { total_playtime: { increment: timeUsedSeconds } },
      });
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, coin: true, total_playtime: true },
    });

    return { game, user };
  });

  return {
    ...updated.game,
    user: updated.user,
  };
}

async function applyPartialGameUpdates(opts: {
  gameId: number;
  userId: number;
  setHintUsed?: boolean;
  timeUsedSeconds?: number;
}) {
  const { gameId, userId, setHintUsed, timeUsedSeconds } = opts;

  const updated = await prisma.$transaction(async (tx) => {
    let gameUpdateData: Record<string, any> | undefined;
    if (setHintUsed) {
      gameUpdateData = { isHintUsed: true };
    }

    const game =
      gameUpdateData && Object.keys(gameUpdateData).length
        ? await tx.game.update({
            where: { id: gameId },
            data: gameUpdateData,
            include: {
              user: { select: { id: true, coin: true, total_playtime: true } },
            },
          })
        : await tx.game.findUnique({
            where: { id: gameId },
            include: {
              user: { select: { id: true, coin: true, total_playtime: true } },
            },
          });

    if (typeof timeUsedSeconds === "number" && timeUsedSeconds > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { total_playtime: { increment: timeUsedSeconds } },
      });
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, coin: true, total_playtime: true },
    });

    return { game, user };
  });

  return {
    ...updated.game!,
    user: updated.user,
  };
}

export async function completeGame(input: gameCompleteInput): Promise<gameCompleteResult> {
  try {
    const {
      gameId,
      userId,
      completed,
      finishedOnTime,
      isHintUsed,
      timeUsedSeconds,
    } = input;

    if (!Number.isFinite(gameId)) {
      console.error("Invalid gameId");
      throw new Error("Invalid gameId");
    }
    if (!Number.isFinite(userId)) {
      console.error("Invalid or missing userId");
      throw new Error("Invalid or missing userId");
    }

    const game = await getGameForCompletion(gameId);
    if (!game) {
      console.error("Game not found");
      throw new Error("Game not found");
    }

    if (game.userId !== userId) {
      console.error("Forbidden: user does not own this game");
      throw new Error("Forbidden: user does not own this game");
    }

    const wantToFinish = completed === true && game.isFinished !== true;

    if (wantToFinish) {
      const isTimerMode = game.timer !== null && game.timer !== undefined;
      const coins = computeCoins({ isTimerMode, completed, finishedOnTime });

      const extraGameData: Record<string, any> = {};
      if (isHintUsed === true && game.isHintUsed !== true) {
        extraGameData.isHintUsed = true;
      }

      const updatedGame = await finalizeGame({
        gameId,
        userId,
        coins,
        extraGameData,
        timeUsedSeconds,
      });

      return { coinsAwarded: coins, alreadyFinished: false, updatedGame };
    }

    const setHintUsed = isHintUsed === true && game.isHintUsed !== true;

    const updatedGame = await applyPartialGameUpdates({
      gameId,
      userId,
      setHintUsed,
      timeUsedSeconds,
    });

    return {
      coinsAwarded: 0,
      alreadyFinished: game.isFinished === true,
      updatedGame,
    };
  } catch (err) {
    console.error("Error completing game:", err);
    throw err;
  }
}
