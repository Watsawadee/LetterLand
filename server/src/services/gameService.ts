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
            questions: rawGameData.gameTemplate.questions.map(
              (q) => q.question
            ),
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

async function hasFinishedBefore(opts: {
  userId: number;
  gameTemplateId: number;
  timer: number | null;
  excludeGameId?: number;
}): Promise<boolean> {
  const { userId, gameTemplateId, timer, excludeGameId } = opts;

  const found = await prisma.game.findFirst({
    where: {
      userId,
      gameTemplateId,
      isFinished: true,
      timer: timer === null ? null : timer,
      ...(excludeGameId ? { NOT: { id: excludeGameId } } : {}),
    },
    select: { id: true },
  });

  return !!found;
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
// service.ts
export async function finalizeGame(opts: {
  gameId: number;
  userId: number;
  coins: number;
  extraGameData?: Record<string, any>;
  secondsToAdd: number;
}) {
  const { gameId, userId, coins, extraGameData = {}, secondsToAdd } = opts;

  const hasGameChanges = Object.keys(extraGameData).length > 0;

  const result = await prisma.$transaction(async (tx) => {
    // 1) Update the game row ONLY if caller provided fields to change
    let gameRecord: { id: number } & { [k: string]: any };
    if (hasGameChanges) {
      gameRecord = await tx.game.update({
        where: { id: gameId },
        data: { ...extraGameData }, // <-- no forced isFinished/finishedAt here
        include: {
          user: { select: { id: true, coin: true, total_playtime: true } },
        },
      });
    } else {
      // Nothing to update on the game; just read it for returning a snapshot
      // (use findUnique instead of update({data:{}}) which would throw)
      gameRecord = await tx.game.findUniqueOrThrow({
        where: { id: gameId },
        include: {
          user: { select: { id: true, coin: true, total_playtime: true } },
        },
      });
    }

    // 2) Increment coins if any
    if (coins > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { coin: { increment: coins } },
      });
    }

    // 3) Increment total playtime if any
    if (secondsToAdd > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { total_playtime: { increment: secondsToAdd } },
      });
    }

    // 4) Read the latest user snapshot to return
    const userSnapshot = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, coin: true, total_playtime: true },
    });

    return { game: gameRecord, user: userSnapshot, secondsAdded: secondsToAdd };
  });

  return {
    ...result.game,
    user: result.user,
    secondsAdded: result.secondsAdded,
  };
}

export async function completeGame(
  input: gameCompleteInput
): Promise<gameCompleteResult> {
  try {
    const { gameId, userId, completed, finishedOnTime, timeUsedSeconds } =
      input;

    if (!Number.isFinite(gameId)) throw new Error("Invalid gameId");
    if (!Number.isFinite(userId)) throw new Error("Invalid or missing userId");

    const game = await getGameForCompletion(gameId);
    if (!game) throw new Error("Game not found");

    // If the game was already finished earlier, do NOT re-award coins.
    if (game.isFinished) {
      // Still add playtime
      const secondsToAdd = Number.isFinite(timeUsedSeconds)
        ? (timeUsedSeconds as number)
        : 0;
      const updatedGame = await finalizeGame({
        gameId,
        userId,
        coins: 0,
        extraGameData: {},
        secondsToAdd,
      });

      return {
        coinsAwarded: 0,
        alreadyFinished: true,
        updatedGame,
        secondsAdded: secondsToAdd,
      };
    }

    const isTimerMode = !!game.timer;
    const baseCoins = computeCoins({
      isTimerMode,
      completed,
      finishedOnTime,
    });

    let coinsToAward = 0;

    if (baseCoins > 0) {
      const alreadyFinishedSameTemplateTimer = await hasFinishedBefore({
        userId,
        gameTemplateId: game.gameTemplateId!,
        timer: game.timer ?? null,
        excludeGameId: gameId,
      });

      // Only award if user has NOT previously finished this template+timer
      coinsToAward = alreadyFinishedSameTemplateTimer ? 0 : baseCoins;
    }

    // We finalize the current game (set finished = true, finishedAt, add playtime, and increment coins)
    const secondsToAdd = Number.isFinite(timeUsedSeconds)
      ? (timeUsedSeconds as number)
      : 0;
    const extraGameData: Record<string, any> = {};

    // Mark finished only when completed
    if (completed) {
      extraGameData.isFinished = true;
      extraGameData.finishedAt = new Date();
    }

    const updatedGame = await finalizeGame({
      gameId,
      userId,
      coins: coinsToAward,
      extraGameData,
      secondsToAdd,
    });

    return {
      coinsAwarded: coinsToAward,
      alreadyFinished: false,
      updatedGame,
      secondsAdded: secondsToAdd,
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
