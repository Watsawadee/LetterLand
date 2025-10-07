// controllers/publicgameController.ts
import { RequestHandler, Request } from "express";
import prisma from "../configs/db";
import {
  ListPublicGamesResponse,
  StartPublicGameResponse,
} from "../types/publicgame";

/** Minimal type to read req.user without changing req.params type */
type WithUser = { user?: { id: number } };
type PublicGamesQuery = { limit?: string; offset?: string };

const toPositiveInt = (value: unknown, fallback: number) => {
  const n =
    typeof value === "string" && value.trim() !== ""
      ? parseInt(value, 10)
      : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

export const listPublicGames: RequestHandler<
  // Params
  Record<string, never>,
  // ResBody
  ListPublicGamesResponse | { error: string },
  // ReqBody
  unknown,
  // ReqQuery
  PublicGamesQuery
> = async (req, res) => {
  try {
    const limit = toPositiveInt(req.query.limit, 20) || 20;
    const offset = toPositiveInt(req.query.offset, 0);

    const [templates, total] = await Promise.all([
      prisma.gameTemplate.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          gameTopic: true,
          gameType: true,
          difficulty: true,
          imageUrl: true,
          gameCode: true, // include if UI needs it
        },
        orderBy: { id: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.gameTemplate.count({ where: { isPublic: true } }),
    ]);

    const items = templates.map((t) => ({
      id: t.id,
      title: t.gameTopic,
      gameType: t.gameType,
      difficulty: t.difficulty,
      imageUrl: t.imageUrl ?? null,
      gameCode: t.gameCode ?? null,
    }));

    res.status(200).json({ total, items });
  } catch (err) {
    console.error("[listPublicGames] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const startPublicGame: RequestHandler<
  // Params
  { templateId: string },
  // ResBody
  StartPublicGameResponse | { error: string }
> = async (req, res) => {
  try {
    const userId = (req as Request & WithUser).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const templateId = parseInt(req.params.templateId, 10);
    if (!Number.isFinite(templateId)) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const template = await prisma.gameTemplate.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        isPublic: true,
        gameTopic: true,
        gameType: true,
        difficulty: true,
        imageUrl: true,
        gameCode: true, // <-- required by response type
      },
    });

    if (!template || !template.isPublic) {
      res.status(404).json({ error: "Template not found or not public" });
      return;
    }

    // Create a new Game for this user from the template
    const game = await prisma.game.create({
      data: {
        userId,
        gameTemplateId: template.id,
      },
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        isHintUsed: true,
        isFinished: true,
        timer: true, // Int? in Game model
      },
    });

    const payload: StartPublicGameResponse = {
      id: game.id,
      templateId: template.id,
      title: template.gameTopic,
      gameType: template.gameType,
      difficulty: template.difficulty,
      imageUrl: template.imageUrl ?? null,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      isHintUsed: game.isHintUsed,
      isFinished: game.isFinished,
      timer: game.timer ?? null,
      gameCode: template.gameCode ?? null, // from GameTemplate
    };

    res.status(201).json(payload);
  } catch (err) {
    console.error("[startPublicGame] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
