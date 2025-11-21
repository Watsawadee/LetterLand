import { getUserWordLearned } from "../../dashboardController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        wordFound: { findMany: jest.fn() },
    },
}));

jest.mock("../../../types/dashboard.schema", () => ({
    WordsLearnedResponseSchema: { parse: (v: any) => v },
}));

const prismaMock = prisma as any;

beforeEach(() => {
    jest.clearAllMocks();
    resetAll();
});

describe("getUserWordLearned", () => {
    it("400 if userId is invalid", async () => {
        const req = mockReq({ params: { userId: "abc" } });
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserWordLearned(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith({ error: "Invalid User ID" });
    });

    it("403 if accessing other user", async () => {
        const req = mockReq({ params: { userId: "2" } });
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserWordLearned(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "Forbidden: You cant access others user's data",
        });
    });

    it("200 returns unique words count (deduplicated)", async () => {
        prismaMock.wordFound.findMany.mockResolvedValue([
            { word: "cat" },
            { word: "dog" },
            { word: "cat" },
            { word: "bird" },
            { word: "dog" },
        ]);

        const req = mockReq({ params: { userId: "1" } });
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserWordLearned(req as any, res);

        expect(prismaMock.wordFound.findMany).toHaveBeenCalledWith({
            where: { userId: 1 },
            select: { word: true },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith({ wordsLearned: 3 });
    });

    it("200 returns 0 when no words found", async () => {
        prismaMock.wordFound.findMany.mockResolvedValue([]);

        const req = mockReq({ params: { userId: "1" } });
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserWordLearned(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith({ wordsLearned: 0 });
    });

    it("500 on prisma error", async () => {
        prismaMock.wordFound.findMany.mockRejectedValue(new Error("DB fail"));

        const req = mockReq({ params: { userId: "1" } });
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserWordLearned(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});