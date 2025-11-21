import { createGameFromGemini } from "../createGameController";
import prisma from "../../configs/db";
import { mockReq, mockRes, resetAll } from "./utils";
import { generateCrosswordHints } from "../../services/geminiService";
import { extractData } from "../../services/extractDataService";
import { genImage } from "../../services/genImageService";
import { generatePronunciation } from "../../services/textToSpeechService";
import { generateGameCode } from "../../services/gameCodeGenerator";

jest.mock("../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn() },
        question: { create: jest.fn(), update: jest.fn() },
        gameTemplate: { create: jest.fn(), update: jest.fn() },
        gameTemplateQuestion: { create: jest.fn() },
        game: { create: jest.fn() }
    }
}));

jest.mock("../../services/geminiService");
jest.mock("../../services/extractDataService");
jest.mock("../../services/genImageService");
jest.mock("../../services/textToSpeechService");
jest.mock("../../services/gameCodeGenerator");

const prismaMock = prisma as any;

beforeEach(() => {
    jest.clearAllMocks();
    resetAll();
});

describe("createGameFromGemini", () => {
    it("400 when schema invalid", async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        await createGameFromGemini(req as any, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("404 when user not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const req = mockReq({
            body: {
                type: "text",
                inputData: "hi",
                userId: 1,
                ownerId: 1,
                difficulty: "A1",
                gameType: "WORD_SEARCH",
                isPublic: false
            }
        });
        const res = mockRes();

        await createGameFromGemini(req as any, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("403 when requested level above user’s level", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            englishLevel: "A1",
            age: 10
        });

        const req = mockReq({
            body: {
                type: "text",
                inputData: "hi",
                userId: 1,
                ownerId: 1,
                difficulty: "B1",
                gameType: "WORD_SEARCH",
                isPublic: false
            }
        });
        const res = mockRes();

        await createGameFromGemini(req as any, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("400 when pdf type but file missing", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            englishLevel: "A1",
            age: 10
        });

        const req = mockReq({
            body: {
                type: "pdf",
                userId: 1,
                ownerId: 1,
                difficulty: "A1",
                gameType: "WORD_SEARCH",
                isPublic: false
            }
        });

        const res = mockRes();
        await createGameFromGemini(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "PDF file is missing" })
        );
    });

    it("500 when Gemini service throws", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            englishLevel: "A1",
            age: 10
        });

        (extractData as jest.Mock).mockResolvedValue("topic text");
        (generateCrosswordHints as jest.Mock).mockRejectedValue(new Error("Gemini fail"));

        const req = mockReq({
            body: {
                type: "text",
                inputData: "hi",
                userId: 1,
                ownerId: 1,
                difficulty: "A1",
                gameType: "WORD_SEARCH",
                isPublic: false
            }
        });

        const res = mockRes();
        await createGameFromGemini(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Failed to generate Gemini prompt" })
        );
    });
});
