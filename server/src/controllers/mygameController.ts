import { Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { GetUserGamesResponse } from "../types/mygame";
import { GameType } from "@prisma/client"; // ✅ Import the enum type

export const getUserGames = async (
  req: AuthenticatedRequest,
  res: Response<GetUserGamesResponse | { error: string }>
) => {
  try {
    const paramUserId = Number(req.params.userId);

    // Guard: token's user must match URL param
    if (!req.user || req.user.id !== paramUserId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const games = await prisma.game.findMany({
      where: { userId: paramUserId },
      select: {
        id: true,
        isFinished: true,
        isHintUsed: true,
        startedAt: true,
        finishedAt: true,
        timer: true,
        gameType: true, // This returns GameType enum
        gameTemplate: {
          select: {
            id: true,
            gameTopic: true,
            difficulty: true,
            imageUrl: true,
            gameCode: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    console.log("📊 [getUserGames] Raw from DB:", games.map(g => ({
      id: g.id,
      gameType: g.gameType,
      typeOfGameType: typeof g.gameType,
    })));

    const items: GetUserGamesResponse["items"] = games.map((g) => ({
      id: g.id,
      isFinished: g.isFinished,
      isHintUsed: g.isHintUsed,
      startedAt: g.startedAt,
      finishedAt: g.finishedAt,
      gameCode: g.gameTemplate.gameCode ?? null,
      timer: g.timer ?? null,
      templateId: g.gameTemplate.id,
      title: g.gameTemplate.gameTopic,
      gameType: g.gameType as "WORD_SEARCH" | "CROSSWORD_SEARCH", // ✅ Explicit cast
      difficulty: g.gameTemplate.difficulty,
      imageUrl: g.gameTemplate.imageUrl ?? null,
    }));

    console.log("📤 [getUserGames] Sending:", items.map(i => ({
      id: i.id,
      gameType: i.gameType,
    })));

    res.status(200).json({ total: items.length, items });
  } catch (error) {
    console.error("❌ [getUserGames] Error:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
};