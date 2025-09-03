
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

// Define the shape of the JSON response
type WordBankResponse = {
  page: number;
  total: number;
  totalPages: number;
  perSide: number;
  left: { n: number; word: string }[];
  right: { n: number; word: string }[];
};

/**
 * GET /user/:userId/word-bank?page=<1-based>
 */
export const getUserWordBankUnique = async (
  req: AuthenticatedRequest,
  res: Response<WordBankResponse>,
  _next?: NextFunction
): Promise<void> => {
  const userId = Number(req.params.userId);
  if (userId !== req.user?.id) {
    res.status(403).json({ error: "Forbidden" } as any); // typecast since error shape is different
    return;
  }

  const page = Math.max(Number(req.query.page ?? 1), 1); // 1-based
  const spreadSize = 10; // 10 words per spread (5 left + 5 right)
  const perSide = 5; // 5 per page/column

  // 1) pull ALL rows in discovery order (oldest -> newest)
  const rows = await prisma.wordFound.findMany({
    where: { userId },
    orderBy: { foundAt: "asc" },
    select: { word: true },
  });

  // 2) make them UNIQUE while preserving order (keep first occurrence)
  const seen = new Set<string>();
  const uniqueInOrder: string[] = [];
  for (const r of rows) {
    if (!seen.has(r.word)) {
      seen.add(r.word);
      uniqueInOrder.push(r.word);
    }
  }

  // 3) paginate by "spread" of 10
  const total = uniqueInOrder.length;
  const totalPages = Math.max(1, Math.ceil(total / spreadSize));
  const start = (page - 1) * spreadSize;
  const pageSlice = uniqueInOrder.slice(start, start + spreadSize);

  // 4) split into left (first 5) / right (next 5)
  const left = pageSlice.slice(0, perSide).map((word, i) => ({
    n: start + i + 1, // absolute number (1-based)
    word,
  }));
  const right = pageSlice.slice(perSide).map((word, i) => ({
    n: start + perSide + i + 1,
    word,
  }));

  res.status(200).json({
    page,
    total,
    totalPages,
    perSide,
    left,
    right,
  });
};