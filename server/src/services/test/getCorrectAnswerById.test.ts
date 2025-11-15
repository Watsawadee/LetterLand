import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockDb: any = {
    wordFound: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        createMany: jest.fn(),
    },
    gameTemplateQuestion: {
        findFirst: jest.fn(),
    },
    game: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    $transaction: jest.fn(),
};

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockDb),
}));

import {
    recordFoundWord,
    batchRecordFoundWords,
    getCorrectAnswerById,
} from "../gameService";

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.resetModules();
});

describe("recordFoundWord", () => {
    it("returns existing row when already recorded (idempotent)", async () => {
        const existing = { id: 1, gameId: 5, userId: 7, questionId: 2, word: "apple" };
        mockDb.wordFound.findFirst.mockResolvedValueOnce(existing);

        const result = await recordFoundWord({
            gameId: 5,
            userId: 7,
            questionId: 2,
            word: "  APPLE  ",
        });

        expect(mockDb.wordFound.findFirst).toHaveBeenCalledWith({
            where: {
                gameId: 5,
                userId: 7,
                questionId: 2,
                word: { equals: "apple", mode: "insensitive" },
            },
        });
        expect(mockDb.wordFound.create).not.toHaveBeenCalled();
        expect(result).toBe(existing);
    });

    it("creates new row when not existing (normalizes word)", async () => {
        mockDb.wordFound.findFirst.mockResolvedValueOnce(null);
        const created = { id: 2, gameId: 5, userId: 7, questionId: 3, word: "apple" };
        mockDb.wordFound.create.mockResolvedValueOnce(created);

        const result = await recordFoundWord({
            gameId: 5,
            userId: 7,
            questionId: 3,
            word: "  ApPlE ",
        });

        expect(mockDb.wordFound.create).toHaveBeenCalledWith({
            data: { userId: 7, gameId: 5, questionId: 3, word: "apple" },
        });
        expect(result).toEqual(created);
    });

    it("throws on prisma error", async () => {
        mockDb.wordFound.findFirst.mockRejectedValueOnce(new Error("DB fail"));
        await expect(
            recordFoundWord({ gameId: 1, userId: 1, questionId: 1, word: "apple" })
        ).rejects.toThrow("Failed to record found word");
    });
});

describe("batchRecordFoundWords", () => {
    it("throws when gameId invalid", async () => {
        await expect(batchRecordFoundWords(NaN as any, [])).rejects.toThrow("Invalid gameId");
    });

    it("returns zeros when no valid rows", async () => {
        const res = await batchRecordFoundWords(10, []);
        expect(res).toEqual({ inserted: 0, skipped: 0, total: 0 });
    });

    it("skips existing and inserts new rows", async () => {
        const gameId = 10;
        const payload = [
            { userId: 1, wordData: { questionId: 2, word: " Apple " } },
            { userId: 1, wordData: { questionId: 2, word: "apple" } },
            { userId: 2, wordData: { questionId: 3, word: "Dog" } },
        ];

        mockDb.wordFound.findMany.mockResolvedValueOnce([
            { userId: 1, questionId: 2, word: "APPLE" },
        ]);
        mockDb.wordFound.createMany.mockResolvedValueOnce({ count: 1 });

        const res = await batchRecordFoundWords(gameId, payload);

        expect(mockDb.wordFound.findMany).toHaveBeenCalledWith({
            where: {
                gameId,
                OR: [
                    { userId: 1, questionId: 2, word: { equals: "apple", mode: "insensitive" } },
                    { userId: 1, questionId: 2, word: { equals: "apple", mode: "insensitive" } },
                    { userId: 2, questionId: 3, word: { equals: "dog", mode: "insensitive" } },
                ],
            },
            select: { userId: true, questionId: true, word: true },
        });

        expect(mockDb.wordFound.createMany).toHaveBeenCalledWith({
            data: [{ gameId, userId: 2, questionId: 3, word: "dog", foundAt: undefined }],
        });

        expect(res).toEqual({ inserted: 1, skipped: 2, total: 3 });
    });

    it("returns all skipped when everything exists", async () => {
        const gameId = 3;
        const payload = [
            { userId: 1, wordData: { questionId: 1, word: "a" } },
            { userId: 1, wordData: { questionId: 2, word: "b" } },
        ];

        mockDb.wordFound.findMany.mockResolvedValueOnce([
            { userId: 1, questionId: 1, word: "A" },
            { userId: 1, questionId: 2, word: "B" },
        ]);
        const res = await batchRecordFoundWords(gameId, payload);
        expect(mockDb.wordFound.createMany).not.toHaveBeenCalled();
        expect(res).toEqual({ inserted: 0, skipped: 2, total: 2 });
    });
});

describe("getCorrectAnswerById", () => {
    it("returns question when link exists", async () => {
        mockDb.gameTemplateQuestion.findFirst.mockResolvedValueOnce({
            question: { id: 7, answer: "apple" },
        });
        const q = await getCorrectAnswerById(100, 7);
        expect(mockDb.gameTemplateQuestion.findFirst).toHaveBeenCalledWith({
            where: { gameTemplateId: 100, questionId: 7 },
            include: { question: { select: { id: true, answer: true } } },
        });
        expect(q).toEqual({ id: 7, answer: "apple" });
    });

    it("returns null when not found", async () => {
        mockDb.gameTemplateQuestion.findFirst.mockResolvedValueOnce(null);
        const q = await getCorrectAnswerById(100, 8);
        expect(q).toBeNull();
    });
});