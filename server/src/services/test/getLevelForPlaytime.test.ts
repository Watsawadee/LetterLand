import { getLevelForPlaytime } from "../getLevelForPlaytime";

describe("getLevelForPlaytime", () => {
    it("returns A1 for very low playtime", () => {
        expect(getLevelForPlaytime(0)).toBe("A1");
        expect(getLevelForPlaytime(10_000)).toBe("A1");
    });

    it("returns A2 when playtime passes the A2 threshold", () => {
        // 220,000 seconds is between A2 and B1 thresholds in your code
        expect(getLevelForPlaytime(220_000)).toBe("A2");
    });

    it("returns B1 / B2 / C1 / C2 for higher playtimes", () => {
        expect(getLevelForPlaytime(350_000)).toBe("B1");
        expect(getLevelForPlaytime(450_000)).toBe("B2");
        expect(getLevelForPlaytime(600_000)).toBe("C1");
        expect(getLevelForPlaytime(800_000)).toBe("C2");
    });

    it("returns correct level exactly at each threshold boundary", () => {
        // These values depend on your LEVEL_THRESHOLDS in getLevelForPlaytime.ts
        const A2 = 60 * 60 * 60;
        const B1 = 90 * 60 * 60;
        const B2 = 120 * 60 * 60;
        const C1 = 150 * 60 * 60;
        const C2 = 180 * 60 * 60;

        expect(getLevelForPlaytime(A2 - 1)).toBe("A1");
        expect(getLevelForPlaytime(A2)).toBe("A2");

        expect(getLevelForPlaytime(B1 - 1)).toBe("A2");
        expect(getLevelForPlaytime(B1)).toBe("B1");

        expect(getLevelForPlaytime(B2 - 1)).toBe("B1");
        expect(getLevelForPlaytime(B2)).toBe("B2");

        expect(getLevelForPlaytime(C1 - 1)).toBe("B2");
        expect(getLevelForPlaytime(C1)).toBe("C1");

        expect(getLevelForPlaytime(C2 - 1)).toBe("C1");
        expect(getLevelForPlaytime(C2)).toBe("C2");
    });
});
