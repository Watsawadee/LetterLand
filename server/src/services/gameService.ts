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
  secondsAdded: number;
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
    const rawGameData = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        gameTemplate: {
          include: {
            questions: {
              select: {
                question: {
                  select: {
                    id: true,
                    name: true,
                    answer: true,
                    hint: true,
                    audioUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!rawGameData) return null;
    const normalized = {
      ...rawGameData,
      gameTemplate: rawGameData.gameTemplate
        ? {
            ...rawGameData.gameTemplate,
            questions: rawGameData.gameTemplate.questions.map((q) => q.question),
          }
        : null,
    };

    return normalized;
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
    const link = await prisma.gameTemplateQuestion.findFirst({
      where: { gameTemplateId, questionId },
      include: {
        question: {
          select: { id: true, answer: true },
        },
      },
    });

    return link?.question ?? null;
  } catch (err) {
    console.error(
      "Error fetching question by gameTemplateId via join table:",
      err
    );
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
    const normalized = String(word).trim().toLowerCase();

    const existing = await prisma.wordFound.findFirst({
      where: {
        gameId,
        userId,
        questionId,
        word: { equals: normalized, mode: "insensitive" },
      },
    });
    if (existing) return existing;

    const found = await prisma.wordFound.create({
      data: {
        userId,
        gameId,
        questionId,
        word: normalized,
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
  const total = clean.length;
  if (!total) return { inserted: 0, skipped: 0, total: 0 };

  const orClauses = clean.map((r) => ({
    userId: r.userId,
    questionId: r.questionId,
    word: { equals: r.word, mode: "insensitive" as const },
  }));

  const existing = await prisma.wordFound.findMany({
    where: { gameId, OR: orClauses },
    select: { userId: true, questionId: true, word: true },
  });

  type ExistingRow = {
    userId: number;
    questionId: number | null;
    word: string;
  };

  const key = (r: { userId: number; questionId: number; word: string }) =>
    `${r.userId}|${r.questionId}|${r.word.toLowerCase()}`;

  const existingKeys = new Set(
    (existing as ExistingRow[])
      .filter(
        (r): r is { userId: number; questionId: number; word: string } =>
          r.questionId !== null
      )
      .map(key)
  );

  const toInsert = clean.filter((r) => !existingKeys.has(key(r)));
  if (!toInsert.length) return { inserted: 0, skipped: total, total };

  const result = await prisma.wordFound.createMany({ data: toInsert });
  const inserted = (result as any)?.count ?? 0;
  const skipped = total - inserted;

  return { inserted, skipped, total };
};

export async function recordExtraWord(
  gameId: number,
  userId: number,
  rawWord: string,
  audioUrl?: string
): Promise<{
  created: boolean;
  totalExtra: number;
  coinsAwarded: number;
  newCoinBalance?: number;
  alreadyCounted?: boolean;
}> {
  const word = String(rawWord || "")
    .trim()
    .toLowerCase();
  if (!word) throw new Error("Word is required");

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, userId: true },
  });
  if (!game) throw new Error("Game not found");
  if (game.userId !== userId) throw new Error("Forbidden: game owner mismatch");

  let created = false;
  let coinsAwarded = 0;
  let newCoinBalance: number | undefined;
  let alreadyCounted = false;

  // Single transaction: insert-if-new, then conditionally award coin or backfill audio
  await prisma.$transaction(async (tx) => {
    const result = await tx.extraWordFound.createMany({
      data: [
        {
          gameId,
          userId,
          word,
          audioUrl: audioUrl ?? undefined,
        },
      ],
      skipDuplicates: true,
    });

    const insertedCount = (result as any)?.count ?? 0;

    if (insertedCount > 0) {
      // New row inserted -> award coin
      created = true;
      coinsAwarded = 1;
      const user = await tx.user.update({
        where: { id: userId },
        data: { coin: { increment: 1 } },
        select: { coin: true },
      });
      newCoinBalance = user.coin;
    } else {
      // Duplicate for (gameId,userId,word)
      alreadyCounted = true;

      // backfill audioUrl if previously null
      if (audioUrl) {
        await tx.extraWordFound.updateMany({
          where: {
            gameId,
            userId,
            word,
            audioUrl: null,
          },
          data: { audioUrl },
        });
      }
    }
  });

  const totalExtra = await prisma.extraWordFound.count({
    where: { gameId, userId },
  });

  return { created, totalExtra, coinsAwarded, newCoinBalance, alreadyCounted };
}

function safeSecondsToAdd(
  timeUsedSeconds?: number | null,
  timer?: number | null
): number {
  const raw = Number.isFinite(timeUsedSeconds as number)
    ? Math.max(0, Math.floor(timeUsedSeconds as number))
    : 0;

  if (!Number.isFinite(timer as number) || (timer as number) <= 0) return raw;
  return Math.min(raw, Math.floor(timer as number));
}

export async function getGameForCompletion(gameId: number) {
  const game = await prisma.game.findUnique({
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
      gameTemplate: { select: { gameCode: true } },
    },
  });
  if (!game) return null;
  const { gameTemplate, ...rest } = game;
  return { ...rest, gameCode: gameTemplate?.gameCode ?? null };
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
  secondsToAdd: number;
}) {
  const { gameId, userId, coins, extraGameData = {}, secondsToAdd } = opts;

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

    if (secondsToAdd > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { total_playtime: { increment: secondsToAdd } },
      });
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, coin: true, total_playtime: true },
    });

    return { game, user, secondsAdded: secondsToAdd };
  });

  return {
    ...updated.game,
    user: updated.user,
    secondsAdded: updated.secondsAdded,
  };
}

async function applyPartialGameUpdates(opts: {
  gameId: number;
  userId: number;
  setHintUsed?: boolean;
  timeUsedSeconds?: number;
}) {
  const { gameId, userId, setHintUsed } = opts;

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

export async function completeGame(
  input: gameCompleteInput
): Promise<gameCompleteResult> {
  try {
    const {
      gameId,
      userId,
      completed,
      finishedOnTime,
      isHintUsed,
      timeUsedSeconds,
    } = input;

    if (!Number.isFinite(gameId)) throw new Error("Invalid gameId");
    if (!Number.isFinite(userId)) throw new Error("Invalid or missing userId");

    const game = await getGameForCompletion(gameId);
    if (!game) throw new Error("Game not found");
    if (game.userId !== userId)
      throw new Error("Forbidden: user does not own this game");

    const secondsToAdd = safeSecondsToAdd(timeUsedSeconds, game.timer);

    if (completed === true) {
      // First-ever finish for this Game row → finalize and (optionally) award coins
      if (game.isFinished !== true) {
        const isTimerMode = game.timer !== null && game.timer !== undefined;

        const coins = computeCoins({
          isTimerMode,
          completed,
          finishedOnTime,
        });

        const extraGameData: Record<string, any> = {};
        if (isHintUsed === true && game.isHintUsed !== true)
          extraGameData.isHintUsed = true;

        const updatedGame = await finalizeGame({
          gameId,
          userId,
          coins,
          extraGameData,
          secondsToAdd,
        });

        return {
          coinsAwarded: coins,
          alreadyFinished: false,
          updatedGame,
          secondsAdded: updatedGame.secondsAdded ?? secondsToAdd,
        };
      }

      // Replay completion: game already finished → just add playtime, no coins
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data:
          secondsToAdd > 0
            ? { total_playtime: { increment: secondsToAdd } }
            : {},
        select: { id: true, coin: true, total_playtime: true },
      });

      return {
        coinsAwarded: 0,
        alreadyFinished: true,
        updatedGame: {
          id: gameId,
          userId,
          isFinished: true,
          user: updatedUser,
        },
        secondsAdded: secondsToAdd,
      };
    }

    // Not completed → partial flags only (no time increment, no coins)
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
      secondsAdded: 0,
    };
  } catch (err) {
    console.error("Error completing game:", err);
    throw err;
  }
}

export async function deleteIncompleteGame(gameId: number, userId: number) {
  if (!Number.isFinite(gameId) || !Number.isFinite(userId)) {
    return { ok: false, message: "Invalid gameId or userId" };
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, userId: true, isFinished: true },
    });

    if (!game) return { ok: false, message: "Game not found" };
    if (game.userId !== userId)
      return {
        ok: false,
        message: "You don't have permission to delete this game",
      };
    if (game.isFinished)
      return { ok: false, message: "Finished games cannot be deleted" };

    await prisma.game.delete({ where: { id: gameId } });
    return { ok: true, data: { id: gameId, userId } };
  } catch (err) {
    console.error("Error deleteIncompleteGame service:", err);
    return { ok: false, message: "Failed to delete game" };
  }
}
