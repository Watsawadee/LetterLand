import { Request, RequestHandler } from "express";
import prisma from "../configs/db";
import { GameType } from "@prisma/client";
import { ListPublicGamesResponse, StartPublicGameResponse } from "../types/publicgame";

/** read req.user without changing Request type */
type WithUser = { user?: { id: number } };
type PublicGamesQuery = { limit?: string; offset?: string };

/** Body for starting/played checks (seconds preferred; minutes kept for back-compat) */
type StartBody = {
  newType?: GameType;
  timerSeconds?: number | null;  // preferred: seconds
  timerMinutes?: number | null;  // optional legacy
};

const toPositiveInt = (value: unknown, fallback: number) => {
  const n =
    typeof value === "string" && value.trim() !== ""
      ? parseInt(value, 10)
      : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

const clampSeconds = (n: unknown): number | null => {
  if (n === null || n === undefined || n === "") return null;
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(0, Math.floor(v));
};

/** Build a public URL for an image key stored in DB (adjust base to your setup) *
/* ================== HANDLERS ================== */

/** GET /publicgame/games */
export const listPublicGames: RequestHandler<
  Record<string, never>,
  ListPublicGamesResponse | { error: string },
  unknown,
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
          difficulty: true,
          imageUrl: true,
          gameCode: true,
          isPublic: true,
        },
        orderBy: { id: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.gameTemplate.count({ where: { isPublic: true } }),
    ]);

    // Template has no gameType in this schema; send a default for display
    const items = templates.map((t) => ({
      id: t.id,
      title: t.gameTopic,
      gameType: "WORD_SEARCH" as const,      // default label on the card
      difficulty: t.difficulty,
      imageUrl: t.imageUrl,// make it loadable in RN <Image>
      gameCode: t.gameCode ?? null,
      isPublic: t.isPublic, 
    }));

    res.status(200).json({ total, items });
  } catch (err) {
    console.error("[listPublicGames] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/** POST /publicgame/games/:templateId/start */
export const startPublicGame: RequestHandler<
  { templateId: string },
  StartPublicGameResponse | { error: string },
  StartBody
> = async (req, res) => {
  try {
    const userId = (req as Request & WithUser).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return;
    };

    const templateId = parseInt(req.params.templateId, 10);
    if (!Number.isFinite(templateId)) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const tpl = await prisma.gameTemplate.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        isPublic: true,
        gameTopic: true,
        difficulty: true,
        imageUrl: true,
        gameCode: true,
      },
    });
    if (!tpl) {
      res.status(404).json({ error: "Template not found" })
      return;
    };
    if (!tpl.isPublic) {
      res.status(403).json({ error: "Template not public" })
      return;
    };

    const body = (req.body || {}) as StartBody;

    // chosen game type lives on Game (not on template in this schema)
    const usedType: GameType = body.newType ?? "WORD_SEARCH";

    // prefer seconds; fallback to minutes
    const timerSeconds =
      body.timerSeconds !== undefined && body.timerSeconds !== null
        ? clampSeconds(body.timerSeconds)
        : body.timerMinutes !== undefined && body.timerMinutes !== null
          ? clampSeconds(Number(body.timerMinutes) * 60)
          : null;

    // Create the game row – IMPORTANT: write gameType here
    const game = await prisma.game.create({
      data: {
        userId,
        gameTemplateId: tpl.id,
        gameType: usedType,
        timer: timerSeconds,       // store SECONDS
      },
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        isHintUsed: true,
        isFinished: true,
        timer: true,
      },
    });

    const payload: StartPublicGameResponse = {
      id: game.id,
      templateId: tpl.id,
      title: tpl.gameTopic,
      gameType: usedType,
      difficulty: tpl.difficulty,
      imageUrl: tpl.imageUrl,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      isHintUsed: game.isHintUsed,
      isFinished: game.isFinished,
      timer: game.timer ?? null,      // seconds back to client
      gameCode: tpl.gameCode ?? null,
    };

    res.status(201).json(payload);
  } catch (err) {
    console.error("[startPublicGame] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/** GET /publicgame/games/:templateId/played?newType=&timerSeconds= */
export const checkPublicGamePlayed: RequestHandler<
  { templateId: string },
  { alreadyPlayed: boolean } | { error: string },
  unknown,
  { newType?: GameType; timerSeconds?: string; timerMinutes?: string }
> = async (req, res) => {
  try {
    const userId = (req as Request & WithUser).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return;
    };

    const templateId = parseInt(req.params.templateId, 10);
    if (!Number.isFinite(templateId)) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const usedType: GameType = (req.query.newType as GameType) ?? "WORD_SEARCH";

    // seconds preferred, fallback to minutes
    let timerSeconds: number | null = null;
    if (req.query.timerSeconds !== undefined) {
      timerSeconds = clampSeconds(req.query.timerSeconds);
    } else if (req.query.timerMinutes !== undefined) {
      timerSeconds = clampSeconds(Number(req.query.timerMinutes) * 60);
    }

    const count = await prisma.game.count({
      where: {
        userId,
        gameTemplateId: templateId,
        gameType: usedType,
        timer: timerSeconds === null ? null : timerSeconds,
      },
    });

    res.json({ alreadyPlayed: count > 0 });
  } catch (err) {
    console.error("[checkPublicGamePlayed] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};