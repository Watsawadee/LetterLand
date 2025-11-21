/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock @prisma/client BEFORE importing the service
const mockDb: any = {
    wordFound: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
};
jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockDb),
}));

import { recordFoundWord } from "../gameService";

describe("recordFoundWord (service)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns existing record when word was already found", async () => {
        const existing = { id: 5, word: "cat", gameId: 1, userId: 10, questionId: 3 };
        mockDb.wordFound.findFirst.mockResolvedValueOnce(existing);

        const res = await recordFoundWord({
            gameId: 1,
            userId: 10,
            questionId: 3,
            word: "  cAt ",
        });

        expect(mockDb.wordFound.findFirst).toHaveBeenCalled();
        expect(mockDb.wordFound.create).not.toHaveBeenCalled();
        expect(res).toEqual(existing);
    });

    it("creates a new found word when not already recorded", async () => {
        mockDb.wordFound.findFirst.mockResolvedValueOnce(null);
        const created = { id: 100, word: "cat", gameId: 1, userId: 10, questionId: 3 };
        mockDb.wordFound.create.mockResolvedValueOnce(created);

        const res = await recordFoundWord({
            gameId: 1,
            userId: 10,
            questionId: 3,
            word: "cat",
        });

        expect(mockDb.wordFound.create).toHaveBeenCalled();
        expect(res).toEqual(created);
    });

    it("throws when prisma fails", async () => {
        mockDb.wordFound.findFirst.mockRejectedValueOnce(new Error("DB fail"));

        await expect(
            recordFoundWord({
                gameId: 1,
                userId: 10,
                questionId: 1,
                word: "cat",
            })
        ).rejects.toThrow("Failed to record found word");
    });
});