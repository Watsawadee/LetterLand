import { getUserAchievements } from "../../achievementController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        achievement: { findMany: jest.fn() },
        game: { count: jest.fn() },
        wordFound: { findMany: jest.fn() },
        extraWordFound: { count: jest.fn() },
        userAchievement: { findFirst: jest.fn() },
    },
}));

const prismaMock = prisma as any;

beforeEach(() => {
    resetAll();
});

describe("getUserAchievements", () => {
    it("401 when no user id", async () => {
        const req = mockReq();
        const res = mockRes();
        await getUserAchievements(req as any, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.status().json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("200 returns sorted enriched achievements", async () => {
        prismaMock.achievement.findMany.mockResolvedValue([
            {
                id: 2,
                name: "Puzzle Solver",
                description: "Complete 3 puzzles to advance",
                coinReward: 20,
                imageUrl: null,
                userAchievements: [{ isCompleted: true, earnedAt: new Date("2025-01-10"), isClaimed: false }],
            },
            {
                id: 1,
                name: "First Puzzle Solved",
                description: "Welcome to your journey!",
                coinReward: 10,
                imageUrl: null,
                userAchievements: [{ isCompleted: false, earnedAt: null, isClaimed: false }],
            },
            {
                id: 3,
                name: "Random Title",
                description: "Something else entirely",
                coinReward: 5,
                imageUrl: null,
                userAchievements: [],
            },
        ]);

        prismaMock.game.count
            .mockResolvedValueOnce(3)
            .mockResolvedValueOnce(3);

        const req = mockReq({ user: { id: 7 } });
        const res = mockRes();

        await getUserAchievements(req as any, res);

        expect(prismaMock.achievement.findMany).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);

        const body = res.status().json.mock.calls[0][0];
        expect(body.message).toBe("Achievements retrieved");
        const data = body.data;

        expect(data.map((a: any) => a.id)).toEqual([1, 2, 3]);

        const first = data[0];
        expect(first.name).toBe("First Puzzle Solved");
        expect(first.progress).toBe(3);
        expect(first.maxProgress).toBe(1);
        expect(first.rank).toBe(1);
        expect(first.isCompleted).toBe(false);

        const second = data[1];
        expect(second.name).toBe("Puzzle Solver");
        expect(second.progress).toBe(3);
        expect(second.maxProgress).toBe(3);
        expect(second.isCompleted).toBe(true);

        const third = data[2];
        expect(third.rank).toBe(9999);
        expect(third.progress).toBe(0);
        expect(third.maxProgress).toBe(1);
    });

    it("500 on prisma error", async () => {
        prismaMock.achievement.findMany.mockRejectedValue(new Error("DB fail"));
        const req = mockReq({ user: { id: 9 } });
        const res = mockRes();

        await getUserAchievements(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith({ message: "Failed to fetch achievements" });
    });
});