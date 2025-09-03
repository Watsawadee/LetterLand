
import { RequestHandler, Request } from "express";
import prisma from "../configs/db";
import {
  ListPublicGamesResponse,
  StartPublicGameResponse,
} from "../types/publicgame";

/** A minimal type to read req.user without changing req.params type */
type WithUser = { user?: { id: number } };

export const listPublicGames: RequestHandler<
  any,
  ListPublicGamesResponse | { error: string }
> = async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit ?? 20);
    const rawOffset = Number(req.query.offset ?? 0);

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 20;
    const offset =
      Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;

    const [templates, total] = await Promise.all([
      prisma.gameTemplate.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          gameTopic: true,
          gameType: true,
          difficulty: true,
          imageUrl: true,
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
    }));

    res.status(200).json({ total, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const startPublicGame: RequestHandler<
  { templateId: string },                                   // params typed here
  StartPublicGameResponse | { error: string }
> = async (req, res) => {
  try {
    // Access user in a structural way without changing req.params type
    const userId = (req as Request & WithUser).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const templateId = Number(req.params.templateId);
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
      },
    });

    if (!template || !template.isPublic) {
      res.status(404).json({ error: "Template not found or not public" });
      return;
    }

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
        gameCode: true,
        timer: true,
      },
    });

    res.status(201).json({
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
      gameCode: game.gameCode ?? null,
      timer: game.timer ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};