
import { Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { GetUserGamesResponse } from "../types/mygame";

export const getUserGames = async (
  req: AuthenticatedRequest,
  res: Response<GetUserGamesResponse | { error: string }>
) => {
  const paramUserId = Number(req.params.userId);

  // Guard: token’s user must match URL param
  if (!req.user || req.user.id !== paramUserId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const games = await prisma.game.findMany({
    where: { userId: paramUserId },
    include: {
      gameTemplate: {
        select: {
          id: true,
          gameTopic: true,
          gameType: true,
          difficulty: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  const items: GetUserGamesResponse["items"] = games.map((g :any) => ({

    id: g.id,
    isFinished: g.isFinished,
    isHintUsed: g.isHintUsed,
    startedAt: g.startedAt,
    finishedAt: g.finishedAt,
    gameCode: g.gameCode,
    timer: g.timer,
    templateId: g.gameTemplate.id,
    title: g.gameTemplate.gameTopic,
    gameType: g.gameTemplate.gameType,
    difficulty: g.gameTemplate.difficulty,
    imageUrl: g.gameTemplate.imageUrl ?? null,
  }));

  res.status(200).json({ total: items.length, items });
};