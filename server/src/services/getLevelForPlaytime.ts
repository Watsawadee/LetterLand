import { EnglishLevel } from "../types/setup.schema";

const LEVEL_THRESHOLDS: Record<EnglishLevel, number> = {
    A1: 30 * 60 * 60,
    A2: 60 * 60 * 60,
    B1: 90 * 60 * 60,
    B2: 120 * 60 * 60,
    C1: 150 * 60 * 60,
    C2: 180 * 60 * 60,
};
export function getLevelForPlaytime(playtime: number): EnglishLevel {
    if (playtime < LEVEL_THRESHOLDS.A2) return "A1";
    if (playtime < LEVEL_THRESHOLDS.B1) return "A2";
    if (playtime < LEVEL_THRESHOLDS.B2) return "B1";
    if (playtime < LEVEL_THRESHOLDS.C1) return "B2";
    if (playtime < LEVEL_THRESHOLDS.C2) return "C1";
    return "C2";
}