import { Request, RequestHandler } from "express";
import prisma from "../configs/db";
import { GameType } from "@prisma/client";
import { ListPublicGamesResponse, StartPublicGameResponse } from "../types/publicgame";

/** Minimal type to read req.user without changing req.params type */
type WithUser = { user?: { id: number } };
type PublicGamesQuery = { limit?: string; offset?: string };

/** Body for starting/playing checks (seconds preferred; minutes kept for back-compat) */
type StartBody = {
  newType?: GameType;
  timerSeconds?: number | null;   // preferred: seconds
  timerMinutes?: number | null;   // optional legacy
};

const toPositiveInt = (value: unknown, fallback: number) => {
  const n = typeof value === "string" && value.trim() !== "" ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

const clampSeconds = (n: unknown): number | null => {
  if (n === null || n === undefined || n === "") return null;
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(0, Math.floor(v));
};

const variantCode = (baseId: number, type: GameType) => `base:${baseId}:type:${type}`;

const copyQuestionMappings = async (fromTemplateId: number, toTemplateId: number) => {
  const qids = await prisma.gameTemplateQuestion.findMany({
    where: { gameTemplateId: fromTemplateId },
    select: { questionId: true },
  });
  if (qids.length === 0) return;
  await prisma.gameTemplateQuestion.createMany({
    data: qids.map((q) => ({ gameTemplateId: toTemplateId, questionId: q.questionId })),
    skipDuplicates: true,
  });
};

const resolveOrCloneVariant = async (baseId: number, newType: GameType | undefined | null) => {
  const base = await prisma.gameTemplate.findUnique({
    where: { id: baseId },
    select: { id: true, isPublic: true, gameTopic: true, gameType: true, difficulty: true, imageUrl: true, ownerId: true },
  });
  if (!base) throw new Error("Template not found");
  if (!base.isPublic) throw new Error("Template not public");

  if (!newType || newType === base.gameType) {
    return { usedTemplateId: base.id, usedType: base.gameType };
  }

  const code = variantCode(base.id, newType);
  const existing = await prisma.gameTemplate.findUnique({ where: { gameCode: code }, select: { id: true } });
  if (existing) return { usedTemplateId: existing.id, usedType: newType };

  const clone = await prisma.gameTemplate.create({
    data: {
      gameTopic: base.gameTopic,
      gameType: newType,
      difficulty: base.difficulty,
      isPublic: base.isPublic,
      imageUrl: base.imageUrl,
      ownerId: base.ownerId,
      gameCode: code,
    },
    select: { id: true },
  });

  await copyQuestionMappings(base.id, clone.id);
  return { usedTemplateId: clone.id, usedType: newType };
};

const maybeResolveVariantId = async (baseId: number, newType: GameType | undefined | null): Promise<number | null> => {
  const base = await prisma.gameTemplate.findUnique({ where: { id: baseId }, select: { id: true, isPublic: true, gameType: true } });
  if (!base || !base.isPublic) return null;
  if (!newType || newType === base.gameType) return base.id;

  const code = variantCode(base.id, newType);
  const variant = await prisma.gameTemplate.findUnique({ where: { gameCode: code }, select: { id: true } });
  return variant ? variant.id : null;
};

/* ================== HANDLERS ================== */

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
        select: { id: true, gameTopic: true, gameType: true, difficulty: true, imageUrl: true, gameCode: true },
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
  { templateId: string },
  StartPublicGameResponse | { error: string },
  StartBody
> = async (req, res) => {
  try {
    const userId = (req as Request & WithUser).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const templateId = parseInt(req.params.templateId, 10);
    if (!Number.isFinite(templateId)) return res.status(400).json({ error: "Invalid templateId" });

    const body = (req.body || {}) as StartBody;
    const requestedType = body.newType;

    // Prefer seconds; if only minutes provided, convert
    const timerSeconds =
      body.timerSeconds !== undefined && body.timerSeconds !== null
        ? clampSeconds(body.timerSeconds)
        : body.timerMinutes !== undefined && body.timerMinutes !== null
        ? clampSeconds(Number(body.timerMinutes) * 60)
        : null;

    const { usedTemplateId } = await resolveOrCloneVariant(templateId, requestedType);

    const tpl = await prisma.gameTemplate.findUnique({
      where: { id: usedTemplateId },
      select: { id: true, gameTopic: true, gameType: true, difficulty: true, imageUrl: true, gameCode: true },
    });
    if (!tpl) return res.status(404).json({ error: "Template not found" });

    const game = await prisma.game.create({
      data: { userId, gameTemplateId: usedTemplateId, timer: timerSeconds }, // store SECONDS
      select: { id: true, startedAt: true, finishedAt: true, isHintUsed: true, isFinished: true, timer: true },
    });

    const payload: StartPublicGameResponse = {
      id: game.id,
      templateId: tpl.id,
      title: tpl.gameTopic,
      gameType: tpl.gameType,
      difficulty: tpl.difficulty,
      imageUrl: tpl.imageUrl ?? null,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      isHintUsed: game.isHintUsed,
      isFinished: game.isFinished,
      timer: game.timer ?? null,      // return SECONDS to client
      gameCode: tpl.gameCode ?? null,
    };

    res.status(201).json(payload);
  } catch (err) {
    console.error("[startPublicGame] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * GET /publicgame/games/:templateId/played?newType=&timerSeconds=
 * Returns { alreadyPlayed: boolean }
 */
export const checkPublicGamePlayed: RequestHandler<
  { templateId: string },
  { alreadyPlayed: boolean } | { error: string },
  unknown,
  { newType?: GameType; timerSeconds?: string; timerMinutes?: string } // accepts either
> = async (req, res) => {
  try {
    const userId = (req as Request & WithUser).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const templateId = parseInt(req.params.templateId, 10);
    if (!Number.isFinite(templateId)) return res.status(400).json({ error: "Invalid templateId" });

    const newType = req.query.newType as GameType | undefined;

    // Prefer seconds; fall back to minutes
    let timerSeconds: number | null = null;
    if (req.query.timerSeconds !== undefined) {
      timerSeconds = clampSeconds(req.query.timerSeconds);
    } else if (req.query.timerMinutes !== undefined) {
      const mins = clampSeconds(String(Number(req.query.timerMinutes) * 60));
      timerSeconds = mins;
    }

    const maybeId = await maybeResolveVariantId(templateId, newType);
    if (!maybeId) return res.json({ alreadyPlayed: false });

    const count = await prisma.game.count({
      where: { userId, gameTemplateId: maybeId, timer: timerSeconds === null ? null : timerSeconds },
    });

    res.json({ alreadyPlayed: count > 0 });
  } catch (err) {
    console.error("[checkPublicGamePlayed] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
