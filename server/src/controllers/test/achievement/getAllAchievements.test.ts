import { getAllAchievements } from "../../achievementController";
import prisma from "../../../configs/db";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        achievement: { findMany: jest.fn() },
        game: { count: jest.fn() },
        wordFound: { findMany: jest.fn() },
        extraWordFound: { count: jest.fn() },
    },
}));

const prismaMock = prisma as any;

describe("getAllAchievements", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns achievements sorted by rank", async () => {
        prismaMock.achievement.findMany.mockResolvedValue([
            {
                id: 1,
                name: "Puzzle Solver",
                description: "Complete 3 puzzles",
                coinReward: 10,
                imageUrl: "img.png",
                userAchievements: [{ isCompleted: false, earnedAt: null, isClaimed: false }],
            },
            {
                id: 2,
                name: "First Puzzle Solved",
                description: "Welcome to your first puzzle",
                coinReward: 5,
                imageUrl: "a.png",
                userAchievements: [{ isCompleted: true, earnedAt: new Date(), isClaimed: true }],
            },
        ]);

        prismaMock.game.count.mockResolvedValue(3); // progress for puzzle
        prismaMock.wordFound.findMany.mockResolvedValue([]);
        prismaMock.extraWordFound.count.mockResolvedValue(0);

        const result = await getAllAchievements(1);

        expect(result.length).toBe(2);
        expect(result[0].name).toBe("First Puzzle Solved"); // rank=1
        expect(result[1].name).toBe("Puzzle Solver");        // rank=4
    });

    it("fills progress, isCompleted, claim flags correctly", async () => {
        prismaMock.achievement.findMany.mockResolvedValue([
            {
                id: 3,
                name: "Curious Finder",
                description: "Find your first extra",
                coinReward: 20,
                imageUrl: null,
                userAchievements: [{ isCompleted: true, earnedAt: new Date("2025-01-01"), isClaimed: false }],
            },
        ]);

        prismaMock.extraWordFound.count.mockResolvedValue(1);

        const result = await getAllAchievements(1);

        expect(result[0]).toMatchObject({
            id: 3,
            name: "Curious Finder",
            progress: 1,
            maxProgress: 1,
            isCompleted: true,
            isClaimed: false,
        });
    });

    it("achievements with no rule get rank=9999", async () => {
        prismaMock.achievement.findMany.mockResolvedValue([
            {
                id: 100,
                name: "Random",
                description: "Not in rule",
                coinReward: 1,
                imageUrl: null,
                userAchievements: [],
            },
        ]);

        const result = await getAllAchievements(1);

        expect(result[0].rank).toBe(9999);
    });
});
