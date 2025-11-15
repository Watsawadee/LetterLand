import { getUserGameStreak } from "../../dashboardController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn(), findMany: jest.fn() },
        game: { findMany: jest.fn() }
    },
}));

const prismaMock = prisma as any;

beforeEach(() => resetAll());

describe("getUserGameStreak", () => {
    it("401 when not authenticated", async () => {
        const req = mockReq();
        const res = mockRes();

        await getUserGameStreak(req as any, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("200 returns all 0 when no games", async () => {
        prismaMock.game.findMany.mockResolvedValue([]);

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserGameStreak(req as any, res);

        expect(res.json).toHaveBeenCalledWith({
            allTime: 0,
            currentLevel: 0,
            highestLevelStreak: 0,
        });
    });

    it("200 computes correct streaks", async () => {
        // User games (3-day streak)
        prismaMock.game.findMany
            .mockResolvedValueOnce([
                { startedAt: new Date("2025-01-01"), gameTemplate: { difficulty: "A1" } },
                { startedAt: new Date("2025-01-02"), gameTemplate: { difficulty: "A1" } },
                { startedAt: new Date("2025-01-03"), gameTemplate: { difficulty: "A1" } },
            ])
            // Peers games
            .mockResolvedValueOnce([
                { startedAt: new Date("2025-01-01"), gameTemplate: { difficulty: "A1" } },
                { startedAt: new Date("2025-01-02"), gameTemplate: { difficulty: "A1" } },
            ]);

        prismaMock.user.findUnique.mockResolvedValue({ englishLevel: "A1" });
        prismaMock.user.findMany.mockResolvedValue([{ id: 2 }]);

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserGameStreak(req as any, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                allTime: 3,
                currentLevel: 3,
                highestStreakInThisLevel: 2,
            })
        );
    });

    it("500 on Prisma error", async () => {
        prismaMock.game.findMany.mockRejectedValue(new Error("fail"));

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserGameStreak(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
