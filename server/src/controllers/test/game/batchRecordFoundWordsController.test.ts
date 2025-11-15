import { batchRecordFoundWordsController } from "../../gameController";
import { mockReq, mockRes } from "../utils";

import prisma from "../../../configs/db";
import {
    getGameData,
    getCorrectAnswerById,
    batchRecordFoundWords
} from "../../../services/gameService";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        wordFound: { findFirst: jest.fn() }
    }
}));

jest.mock("../../../services/gameService", () => ({
    getGameData: jest.fn(),
    getCorrectAnswerById: jest.fn(),
    batchRecordFoundWords: jest.fn()
}));

const prismaMock = prisma as any;

describe("batchRecordFoundWordsController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("400 when invalid gameId", async () => {
        const req = mockReq({
            params: { gameId: "abc" },
            body: { foundWords: [] }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid data" });
    });

    it("400 when foundWords is not array", async () => {
        const req = mockReq({
            params: { gameId: "1" },
            body: { foundWords: "wrong" }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid data" });
    });

    it("400 when missing required fields inside foundWords", async () => {
        (getGameData as jest.Mock).mockResolvedValue({ gameTemplateId: 99 });

        const req = mockReq({
            params: { gameId: "1" },
            body: {
                foundWords: [
                    {
                        userId: 1,
                        wordData: { questionId: null, word: "" }
                    }
                ]
            }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing required fields" });
    });

    it("400 when question not found", async () => {
        (getGameData as jest.Mock).mockResolvedValue({ gameTemplateId: 99 });
        (getCorrectAnswerById as jest.Mock).mockResolvedValue(null);

        const req = mockReq({
            params: { gameId: "1" },
            body: {
                foundWords: [
                    {
                        userId: 1,
                        wordData: { questionId: 10, word: "cat" }
                    }
                ]
            }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Question not found: 10"
        });
    });

    it("400 when word does not match correct answer", async () => {
        (getGameData as jest.Mock).mockResolvedValue({ gameTemplateId: 99 });
        (getCorrectAnswerById as jest.Mock).mockResolvedValue({ answer: "dog" });

        const req = mockReq({
            params: { gameId: "1" },
            body: {
                foundWords: [
                    {
                        userId: 1,
                        wordData: { questionId: 1, word: "cat" }
                    }
                ]
            }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Word does not match the answer for questionId 1"
        });
    });

    it("200 returns no items to record", async () => {
        (getGameData as jest.Mock).mockResolvedValue({ gameTemplateId: 99 });

        const req = mockReq({
            params: { gameId: "1" },
            body: { foundWords: [] }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "No items to record",
            data: { inserted: 0, skipped: 0, total: 0 }
        });
    });

    it("201 when new words inserted", async () => {
        (getGameData as jest.Mock).mockResolvedValue({ gameTemplateId: 99 });
        (getCorrectAnswerById as jest.Mock).mockResolvedValue({ answer: "cat" });

        (batchRecordFoundWords as jest.Mock).mockResolvedValue({
            inserted: 3,
            skipped: 1,
            total: 4
        });

        const req = mockReq({
            params: { gameId: "1" },
            body: {
                foundWords: [
                    {
                        userId: 1,
                        wordData: { questionId: 1, word: "cat" }
                    }
                ]
            }
        });
        (getCorrectAnswerById as jest.Mock).mockResolvedValue({ answer: "cat" });

        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Batch recorded",
            data: { inserted: 3, skipped: 1, total: 4 }
        });
    });

    it("200 when no new words inserted (inserted=0)", async () => {
        (getGameData as jest.Mock).mockResolvedValue({ gameTemplateId: 99 });
        (getCorrectAnswerById as jest.Mock).mockResolvedValue({ answer: "cat" });

        (batchRecordFoundWords as jest.Mock).mockResolvedValue({
            inserted: 0,
            skipped: 2,
            total: 2
        });

        const req = mockReq({
            params: { gameId: "1" },
            body: {
                foundWords: [
                    {
                        userId: 1,
                        wordData: { questionId: 1, word: "cat" }
                    }
                ]
            }
        });

        const res = mockRes();
        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "No new words to record",
            data: { inserted: 0, skipped: 2, total: 2 }
        });
    });

    it("500 on unexpected error", async () => {
        (getGameData as jest.Mock).mockRejectedValue(new Error("fail"));

        const req = mockReq({
            params: { gameId: "1" },
            body: { foundWords: [] }
        });
        const res = mockRes();

        await batchRecordFoundWordsController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Batch record failed" });
    });
});
