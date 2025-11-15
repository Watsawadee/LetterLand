import { getNextLevel, startOfISOWeekUTC, secondsBetween } from "../levelupService";
import { EnglishLevel } from "@prisma/client";

describe("getNextLevel", () => {
    it("returns the next CEFR level when available", () => {
        expect(getNextLevel("A1" as EnglishLevel)).toBe("A2");
        expect(getNextLevel("B1" as EnglishLevel)).toBe("B2");
    });

    it("returns null when user is already at highest level", () => {
        expect(getNextLevel("C2" as EnglishLevel)).toBeNull();
    });
});

describe("startOfISOWeekUTC", () => {
    it("returns Monday 00:00:00 UTC for a date in the middle of the week", () => {
        const d = new Date(Date.UTC(2024, 9, 16)); // 16 Oct 2024 (Wednesday)
        const start = startOfISOWeekUTC(d);

        expect(start.toISOString()).toBe("2024-10-14T00:00:00.000Z"); // Monday
    });

    it("keeps the same date if it is already Monday", () => {
        const monday = new Date(Date.UTC(2024, 9, 14)); // Monday
        const start = startOfISOWeekUTC(monday);

        expect(start.toISOString()).toBe("2024-10-14T00:00:00.000Z");
    });
});

describe("secondsBetween", () => {
    it("returns the number of whole seconds between two dates", () => {
        const start = new Date("2024-10-10T10:00:00Z");
        const end = new Date("2024-10-10T10:00:15Z");
        expect(secondsBetween(start, end)).toBe(15);
    });

    it("never returns a negative value", () => {
        const start = new Date("2024-10-10T10:00:15Z");
        const end = new Date("2024-10-10T10:00:00Z");
        expect(secondsBetween(start, end)).toBe(0);
    });
});