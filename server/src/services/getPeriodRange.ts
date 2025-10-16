import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export function getPeriodRange(period: string, date: Date) {
    if (period === "week") {
        return {
            start: startOfWeek(date, { weekStartsOn: 0 }),
            end: endOfWeek(date, { weekStartsOn: 0 }),
        };
    }
    if (period === "month") {
        return {
            start: startOfMonth(date),
            end: endOfMonth(date),
        };
    }
    if (period === "year") {
        return {
            start: startOfYear(date),
            end: endOfYear(date),
        };
    }
    throw new Error("Invalid period");
}