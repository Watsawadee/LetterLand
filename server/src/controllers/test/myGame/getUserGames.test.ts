import { getUserGames } from "../../mygameController";
import prisma from "../../../configs/db";
import { mockReq, mockRes } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        game: { findMany: jest.fn() },
    },
}));

const prismaMock = prisma as any;

describe("getUserGames Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("403 when token user does not match URL param", async () => {
        const req = mockReq({
            params: { userId: "10" },
            user: { id: 99 },
        });
        const res = mockRes();

        await getUserGames(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    it("200 returns mapped game items", async () => {
        prismaMock.game.findMany.mockResolvedValue([
            {
                id: 1,
                isFinished: true,
                isHintUsed: false,
                startedAt: new Date("2024-01-01"),
                finishedAt: new Date("2024-01-01"),
                timer: 60,
                gameType: "WORD_SEARCH",
                gameTemplate: {
                    id: 101,
                    gameTopic: "Animals",
                    difficulty: "EASY",
                    imageUrl: "img.png",
                    gameCode: "AA1001",
                },
            },
        ]);

        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
        });
        const res = mockRes();

        await getUserGames(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            total: 1,
            items: [
                expect.objectContaining({
                    id: 1,
                    gameType: "WORD_SEARCH",
                    templateId: 101,
                    title: "Animals",
                    difficulty: "EASY",
                    imageUrl: "img.png",
                    gameCode: "AA1001",
                }),
            ],
        });
    });

    it("200 handles CROSSWORD_SEARCH", async () => {
        prismaMock.game.findMany.mockResolvedValue([
            {
                id: 2,
                isFinished: false,
                isHintUsed: false,
                startedAt: new Date(),
                finishedAt: null,
                timer: null,
                gameType: "CROSSWORD_SEARCH",
                gameTemplate: {
                    id: 202,
                    gameTopic: "Countries",
                    difficulty: "MEDIUM",
                    imageUrl: null,
                    gameCode: "BB2002",
                },
            },
        ]);

        const req = mockReq({
            params: { userId: "5" },
            user: { id: 5 },
        });
        const res = mockRes();

        await getUserGames(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            total: 1,
            items: [
                expect.objectContaining({
                    id: 2,
                    gameType: "CROSSWORD_SEARCH",
                    templateId: 202,
                }),
            ],
        });
    });

    it("500 when DB throws", async () => {
        prismaMock.game.findMany.mockRejectedValue(new Error("DB fail"));

        const req = mockReq({
            params: { userId: "1" },
            user: { id: 1 },
        });
        const res = mockRes();

        await getUserGames(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch games" });
    });
});