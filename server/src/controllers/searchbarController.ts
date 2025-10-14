// controllers/searchController.ts
import { Request, Response } from 'express';
import prisma from '../configs/db';

export const searchGames = async (req: Request, res: Response): Promise<void> => {
  try {
    // Back-compat: support both new & old params
    // q OR gameName; levels (CSV/array) OR difficulty (single)
    const qRaw =
      (req.query.q as string | undefined) ??
      (req.query.gameName as string | undefined);

    const rawLevels =
      (req.query.levels as string | string[] | undefined) ??
      (req.query.difficulty as string | undefined);

    // --- normalize levels into string[] ---
    let levelTags: string[] = [];
    if (Array.isArray(rawLevels)) {
      levelTags = rawLevels
        .flatMap(v => (v ?? '').split(','))
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    } else if (typeof rawLevels === 'string') {
      levelTags = rawLevels
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }

    const ALLOWED = new Set(['A1','A2','B1','B2','C1','C2']);
    const levels = levelTags.filter(lv => ALLOWED.has(lv));

   // controllers/searchController.ts
const where: any = { isPublic: true }; // ← only public templates

if (qRaw && qRaw.trim()) {
  const needle = qRaw.trim();
  where.OR = [
    { gameTopic: { contains: needle, mode: "insensitive" } },
    { gameCode:  { contains: needle, mode: "insensitive" } },
  ];
}

if (levels.length > 0) {
  where.difficulty = { in: levels as any };
}


    const templates = await prisma.gameTemplate.findMany({
      where,
      select: {
        id: true,
        gameTopic: true,
        difficulty: true,
        imageUrl: true,
        gameCode: true,
      },
      // orderBy: { id: 'desc' },
    });

    const games = templates.map(t => ({
      id: t.id,
      title: t.gameTopic,
      difficulty: t.difficulty,
      imageUrl: t.imageUrl ?? null,
      code: t.gameCode ?? null, // optional, handy for UI
    }));

    res.json({ games });
  } catch (error) {
    console.error('[searchGames] error:', error);
    res.status(500).json({ error: 'An error occurred while searching for games.' });
  }
};
