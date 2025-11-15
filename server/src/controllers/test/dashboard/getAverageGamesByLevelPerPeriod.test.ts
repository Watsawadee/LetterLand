import { getAverageGamesByLevelPerPeriod } from "../../dashboardController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn(), findMany: jest.fn() },
        game: { findMany: jest.fn() }
    },
}));

jest.mock("../../../types/dashboard.schema", () => ({
    AverageGamesByLevelPeerMultiplePeriodResponseSchema: {
        parse: (v: any) => v,
    },
}));

const prismaMock = prisma as any;

beforeEach(() => resetAll());

describe("getAverageGamesByLevelPerPeriod", () => {
    it("401 when no auth", async () => {
        const req = mockReq({ query: { period: "week" } });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("400 invalid period", async () => {
        const req = mockReq({
            user: { id: 1 },
            query: { period: "invalid" },
        });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("400 invalid date", async () => {
        const req = mockReq({
            user: { id: 1 },
            query: { period: "week", date: "not-a-date" },
        });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("404 when user not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const req = mockReq({
            user: { id: 1 },
            query: { period: "week" },
        });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("200 returns peer averages (week)", async () => {
        const fixedDate = new Date("2025-01-15T00:00:00Z");
        jest.useFakeTimers().setSystemTime(fixedDate);

        // Current user
        prismaMock.user.findUnique.mockResolvedValue({ englishLevel: "A1" });

        // Mock peers
        prismaMock.user.findMany.mockResolvedValue([{ id: 2 }, { id: 3 }]);

        // Mock peer games (2 peers, 2 games in same bucket)
        prismaMock.game.findMany.mockResolvedValue([
            { startedAt: new Date("2025-01-13T10:00:00Z") },
            { startedAt: new Date("2025-01-13T12:00:00Z") },
        ]);

        const req = mockReq({
            user: { id: 1 },
            query: { period: "week", date: "2025-01-15" },
        });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);
        expect(res.status).toHaveBeenCalledWith(200);

        const json = res.json.mock.calls[0][0];
        const current = json.results[0];

        expect(current.labels).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
        expect(current.counts[1]).toBeCloseTo(1);
    });

    it("200 peerCount=0 → all counts = 0", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ englishLevel: "A1" });

        prismaMock.user.findMany.mockResolvedValue([]);
        const req = mockReq({
            user: { id: 1 },
            query: { period: "week" },
        });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);

        const current = res.json.mock.calls[0][0].results[0];
        expect(current.counts.every((v: number) => v === 0)).toBe(true);
    });

    it("500 on prisma error", async () => {
        prismaMock.user.findUnique.mockRejectedValue(new Error("DB error"));

        const req = mockReq({
            user: { id: 1 },
            query: { period: "week" },
        });
        const res = mockRes();

        await getAverageGamesByLevelPerPeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
