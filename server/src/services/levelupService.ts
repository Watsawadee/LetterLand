import { EnglishLevel } from "@prisma/client";

export const LEVEL_ORDER: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function getNextLevel(level: EnglishLevel): EnglishLevel | null {
    const order: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const i = order.indexOf(level);
    if (i < 0 || i === order.length - 1) return null;
    return order[i + 1]!;
}
export function startOfISOWeekUTC(d: Date): Date {
    // Make a copy
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    // JS: getUTCDay() -> 0=Sun..6=Sat; ISO week starts Mon=1
    const day = date.getUTCDay() || 7; // convert Sun(0) -> 7
    if (day > 1) date.setUTCDate(date.getUTCDate() - (day - 1));
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

export function secondsBetween(start: Date, end: Date): number {
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}