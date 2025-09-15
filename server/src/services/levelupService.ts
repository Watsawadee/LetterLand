import { EnglishLevel } from "@prisma/client";

export const LEVEL_ORDER: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function getNextLevel(current: EnglishLevel): EnglishLevel | null {
    const idx = LEVEL_ORDER.indexOf(current);
    if (idx < 0 || idx === LEVEL_ORDER.length - 1) return null;
    return LEVEL_ORDER[idx + 1];
}