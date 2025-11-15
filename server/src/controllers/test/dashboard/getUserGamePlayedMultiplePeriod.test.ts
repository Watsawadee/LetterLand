import { getUserGamesPlayedMultiplePeriod } from "../../dashboardController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        game: { findMany: jest.fn() }
    }
}));

jest.mock("../../../types/dashboard.schema", () => ({
    GamesPlayedMultiplePeriodResponseSchema: { parse: (v: any) => v },
}));

const prismaMock = prisma as any;

beforeEach(() => {
    resetAll();
});

describe("getUserGamesPlayedMultiplePeriod", () => {
    it("403 when accessing another user", async () => {
        const req = mockReq({
            params: { userId: "2" },
            user: { id: 1 },
            query: { period: "week" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "Forbidden: Data cant be accessed",
        });
    });

    it("400 for invalid period", async () => {
        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
            query: { period: "invalid" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith({ error: "Invalid period" });
    });

    it("400 for invalid date format", async () => {
        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
            query: { period: "week", date: "not-a-date" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith({ error: "Invalid date" });
    });

    it("200 returns correct week data", async () => {
        const fixedDate = new Date("2025-01-15T00:00:00Z");

        jest.useFakeTimers().setSystemTime(fixedDate);

        prismaMock.game.findMany.mockResolvedValue([
            {
                startedAt: new Date("2025-01-13T10:00:00Z"), // Monday
            },
            {
                startedAt: new Date("2025-01-14T10:00:00Z"), // Tuesday
            },
        ]);

        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
            query: { period: "week", date: "2025-01-15" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);

        const json = res.json.mock.calls[0][0];

        expect(json.results.length).toBe(5);

        const current = json.results[0];

        expect(current.labels).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]);
        expect(current.counts).toEqual([0, 1, 1, 0, 0, 0, 0]);
    });

    it("200 returns correct month data", async () => {
        prismaMock.game.findMany.mockResolvedValue([
            { startedAt: new Date("2025-01-02T10:00:00Z") }, // W1
            { startedAt: new Date("2025-01-10T10:00:00Z") }, // W2
        ]);

        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
            query: { period: "month", date: "2025-01-15" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);

        const current = res.json.mock.calls[0][0].results[0];

        expect(current.labels).toEqual(["W1", "W2", "W3", "W4", "W5"]);
    });

    it("200 returns correct year data", async () => {
        prismaMock.game.findMany.mockResolvedValue([
            { startedAt: new Date("2025-03-10T10:00:00Z") },
            { startedAt: new Date("2025-03-15T10:00:00Z") },
        ]);

        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
            query: { period: "year", date: "2025-01-15" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);

        const current = res.json.mock.calls[0][0].results[0];

        expect(current.labels).toEqual([
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]);
    });

    it("500 on prisma error", async () => {
        prismaMock.game.findMany.mockRejectedValue(new Error("DB error!"));

        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
            query: { period: "week" },
        });
        const res = mockRes();

        await getUserGamesPlayedMultiplePeriod(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "Internal Server Error",
        });
    });
});
