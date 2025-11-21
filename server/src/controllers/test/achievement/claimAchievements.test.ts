import { triggerAchievementCheck } from "../../achievementController";
import prisma from "../../../configs/db";
import { mockReq, mockRes } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        achievement: { findMany: jest.fn() },
        game: { count: jest.fn() },
        wordFound: { findMany: jest.fn() },
        extraWordFound: { count: jest.fn() },
        userAchievement: {
            findFirst: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
    },
}));

describe("triggerAchievementCheck", () => {
    const prismaMock = prisma as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("401 when not authenticated", async () => {
        const req = mockReq();
        const res = mockRes();
        await triggerAchievementCheck(req as any, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("handles completed vs incomplete achievements", async () => {
        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        prismaMock.achievement.findMany.mockResolvedValue([
            {
                id: 1,
                name: "Puzzle Solver",
                description: "Complete 3 puzzles",
                coinReward: 20,
                imageUrl: null,
                userAchievements: [{ isCompleted: false, earnedAt: null, isClaimed: false }],
            },
            {
                id: 2,
                name: "Random Title",
                description: "Something else entirely",
                coinReward: 5,
                imageUrl: null,
                userAchievements: [],
            },
        ]);
        prismaMock.game.count.mockResolvedValue(3);
        prismaMock.userAchievement.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        await triggerAchievementCheck(req as any, res);

        expect(prismaMock.userAchievement.create).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("500 on error", async () => {
        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();
        prismaMock.achievement.findMany.mockRejectedValue(new Error("fail"));

        await triggerAchievementCheck(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});