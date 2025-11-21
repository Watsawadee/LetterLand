import { getPeriodRange } from "../getPeriodRange";

describe("getPeriodRange", () => {
    const sampleDate = new Date(2024, 9, 16); // 16 Oct 2024 (local, but we only check Y/M/D)

    it("returns the correct week range (Sunday–Saturday)", () => {
        const { start, end } = getPeriodRange("week", sampleDate);

        expect(start.getFullYear()).toBe(2024);
        expect(start.getMonth()).toBe(9);
        expect(start.getDate()).toBe(13); // Sunday

        expect(end.getFullYear()).toBe(2024);
        expect(end.getMonth()).toBe(9);
        expect(end.getDate()).toBe(19); // Saturday
    });

    it("returns the correct month range", () => {
        const { start, end } = getPeriodRange("month", sampleDate);

        expect(start.getDate()).toBe(1);
        expect(end.getMonth()).toBe(9);
        expect(end.getDate()).toBe(31); // October has 31 days
    });

    it("returns the correct year range", () => {
        const { start, end } = getPeriodRange("year", sampleDate);

        expect(start.getFullYear()).toBe(2024);
        expect(start.getMonth()).toBe(0);
        expect(start.getDate()).toBe(1);

        expect(end.getFullYear()).toBe(2024);
        expect(end.getMonth()).toBe(11);
        expect(end.getDate()).toBe(31);
    });

    it("throws an error for invalid period", () => {
        expect(() => getPeriodRange("day", sampleDate)).toThrow("Invalid period");
    });


    it("month range matches last calendar day of that month", () => {
        const febLeapYear = new Date(2024, 1, 10); // Feb 2024
        const { end } = getPeriodRange("month", febLeapYear);
        expect(end.getDate()).toBe(29); // leap year February has 29
    });
});