import prisma from "../configs/db";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

// Define param + query types
type WordBankParams = {
  userId: string; // Express always gives params as string
};

type WordBankQuery = {
  page?: string; // query params come in as string
};

type SpreadSideRow = { n: number; word: string };
type SpreadSection = {
  total: number;
  totalPages: number;
  left: SpreadSideRow[];
  right: SpreadSideRow[];
};
type WordBankCombinedResponse = {
  page: number;
  perSide: number;
  spreadSize: number;
  words: SpreadSection;
  extra: SpreadSection;
};

function uniquePreserveOrder(words: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

function buildSpread(
  uniqueInOrder: string[],
  page: number,
  perSide: number,
  spreadSize: number
): SpreadSection {
  const total = uniqueInOrder.length;
  const totalPages = Math.max(1, Math.ceil(total / spreadSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const start = (safePage - 1) * spreadSize;
  const slice = uniqueInOrder.slice(start, start + spreadSize);

  const left = slice.slice(0, perSide).map((word, i) => ({
    n: start + i + 1,
    word,
  }));
  const right = slice.slice(perSide).map((word, i) => ({
    n: start + perSide + i + 1,
    word,
  }));

  return { total, totalPages, left, right };
}

export const getUserWordBankUnique = async (
  req: AuthenticatedRequest,
  res: Response<WordBankCombinedResponse>,
  _next?: NextFunction
): Promise<void> => {
  const userId = Number(req.params.userId);
  if (userId !== req.user?.id) {
    res.status(403).json({ error: "Forbidden" } as any);
    return;
  }

  const page = Math.max(Number(req.query.page ?? 1), 1);
  const perSide = 5; // 5 per column
  const spreadSize = 10; // 10 per spread (5 left + 5 right)

  const [learnedRows, extraRows] = await Promise.all([
    prisma.wordFound.findMany({
      where: { userId },
      orderBy: { foundAt: "asc" },
      select: { word: true },
    }),
    prisma.extraWordFound.findMany({
      where: { userId },
      orderBy: { foundAt: "asc" },
      select: { word: true },
    }),
  ]);

  // De-dupe while preserving order (per section)
  const learnedUnique = uniquePreserveOrder(learnedRows.map((r) => r.word));
  const extraUnique = uniquePreserveOrder(extraRows.map((r) => r.word));

  // Build per-section spreads using the same requested page
  const words = buildSpread(learnedUnique, page, perSide, spreadSize);
  const extra = buildSpread(extraUnique, page, perSide, spreadSize);

  res.status(200).json({
    page,
    perSide,
    spreadSize,
    words,
    extra,
  });
};
