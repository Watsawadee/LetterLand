const mockDb: any = {
    wordFound: {
        findMany: jest.fn(),
        createMany: jest.fn(),
    },
};
jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockDb),
}));

import { batchRecordFoundWords } from "../gameService";

describe("batchRecordFoundWords (service)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("throws on invalid gameId", async () => {
        await expect(batchRecordFoundWords(NaN as any, []))
            .rejects
            .toThrow("Invalid gameId");
    });

    it("returns 0,0,0 when no valid items (empty array)", async () => {
        const res = await batchRecordFoundWords(1, []);
        expect(res).toEqual({ inserted: 0, skipped: 0, total: 0 });
    });

    it("returns 0,0,0 when foundWords undefined", async () => {
        const res = await batchRecordFoundWords(1, undefined as any);
        expect(res).toEqual({ inserted: 0, skipped: 0, total: 0 });
    });

    it("filters out invalid rows (non-finite ids, empty word)", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([]);
        mockDb.wordFound.createMany.mockResolvedValueOnce({ count: 1 });

        const res = await batchRecordFoundWords(5, [
            { userId: 1, wordData: { questionId: 1, word: "ok" } },
            { userId: NaN, wordData: { questionId: 2, word: "bad" } },
            { userId: 3, wordData: { questionId: NaN as any, word: "bad" } },
            { userId: 4, wordData: { questionId: 9, word: "   " } },
            { userId: 5, wordData: { questionId: 10, word: "" } },
        ]);

        expect(res).toEqual({ inserted: 1, skipped: 0, total: 1 });
        expect(mockDb.wordFound.findMany).toHaveBeenCalledTimes(1);
        expect(mockDb.wordFound.createMany).toHaveBeenCalledTimes(1);
    });

    it("skips all when duplicates exist (case-insensitive)", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([
            { userId: 1, questionId: 1, word: "cat" },
        ]);

        const res = await batchRecordFoundWords(1, [
            { userId: 1, wordData: { questionId: 1, word: "cat" } },
        ]);

        expect(res).toEqual({ inserted: 0, skipped: 1, total: 1 });
        expect(mockDb.wordFound.createMany).not.toHaveBeenCalled();
    });

    it("skips internal duplicates already in DB even with different casing/spacing", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([
            { userId: 2, questionId: 4, word: "cat" },
        ]);

        const res = await batchRecordFoundWords(9, [
            { userId: 2, wordData: { questionId: 4, word: "  Cat  " } },
            { userId: 2, wordData: { questionId: 4, word: "cAt" } },
        ]);

        expect(res).toEqual({ inserted: 0, skipped: 2, total: 2 });
        expect(mockDb.wordFound.createMany).not.toHaveBeenCalled();
    });

    it("inserts new unique records", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([]); // no duplicates
        mockDb.wordFound.createMany.mockResolvedValueOnce({ count: 2 });

        const res = await batchRecordFoundWords(1, [
            { userId: 1, wordData: { questionId: 1, word: "cat" } },
            { userId: 2, wordData: { questionId: 3, word: "dog" } },
        ]);

        expect(mockDb.wordFound.createMany).toHaveBeenCalled();
        expect(res).toEqual({ inserted: 2, skipped: 0, total: 2 });
    });

    it("handles mix of duplicates and new entries", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([
            { userId: 1, questionId: 1, word: "cat" },
        ]);
        mockDb.wordFound.createMany.mockResolvedValueOnce({ count: 2 });

        const res = await batchRecordFoundWords(4, [
            { userId: 1, wordData: { questionId: 1, word: "cat" } },   // duplicate
            { userId: 2, wordData: { questionId: 5, word: "lion" } },  // new
            { userId: 3, wordData: { questionId: 6, word: "tiger" } }, // new
        ]);

        expect(res).toEqual({ inserted: 2, skipped: 1, total: 3 });
        expect(mockDb.wordFound.createMany).toHaveBeenCalledTimes(1);
        const createArg = mockDb.wordFound.createMany.mock.calls[0][0].data;
        expect(createArg.length).toBe(2);
        expect(createArg.map((r: any) => r.word).sort()).toEqual(["lion", "tiger"]);
    });

    it("passes converted Date for foundAt string", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([]);
        mockDb.wordFound.createMany.mockResolvedValueOnce({ count: 1 });

        const iso = "2025-01-02T10:11:12Z";
        await batchRecordFoundWords(8, [
            {
                userId: 4,
                wordData: { questionId: 9, word: "moon", foundAt: iso },
            },
        ]);

        const arg = mockDb.wordFound.createMany.mock.calls[0][0].data[0];
        expect(arg.foundAt instanceof Date).toBe(true);
        expect(arg.foundAt.getTime()).toBe(new Date(iso).getTime()); // robust comparison
    });

    it("returns inserted 0 skipped total when all candidates become duplicates after existing join", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([
            { userId: 1, questionId: 2, word: "star" },
            { userId: 1, questionId: 3, word: "sun" },
        ]);

        const res = await batchRecordFoundWords(12, [
            { userId: 1, wordData: { questionId: 2, word: "STAR" } },
            { userId: 1, wordData: { questionId: 3, word: " Sun " } },
        ]);

        expect(res).toEqual({ inserted: 0, skipped: 2, total: 2 });
        expect(mockDb.wordFound.createMany).not.toHaveBeenCalled();
    });

    it("throws when prisma fails", async () => {
        mockDb.wordFound.findMany.mockRejectedValueOnce(new Error("fail"));

        await expect(
            batchRecordFoundWords(1, [
                { userId: 1, wordData: { questionId: 1, word: "cat" } },
            ])
        ).rejects.toThrow("fail");
    });

    it("handles createMany returning count 0 (e.g., unique constraint skip)", async () => {
        mockDb.wordFound.findMany.mockResolvedValueOnce([]);
        mockDb.wordFound.createMany.mockResolvedValueOnce({ count: 0 });

        const res = await batchRecordFoundWords(3, [
            { userId: 9, wordData: { questionId: 2, word: "leaf" } },
        ]);

        expect(res).toEqual({ inserted: 0, skipped: 1, total: 1 });
    });
});