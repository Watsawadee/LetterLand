import { GameType, EnglishLevel } from "@prisma/client";
import {
    listPublicGames,
    startPublicGame,
    checkPublicGamePlayed,
} from "../publicgameController";
import { mockReq, mockRes } from "./utils";

jest.mock("../../configs/db", () => ({
    __esModule: true,
    default: {
        gameTemplate: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
        },
        game: {
            create: jest.fn(),
            count: jest.fn(),
        },
    },
}));

const prisma = require("../../configs/db").default;

beforeEach(() => {
    jest.clearAllMocks();
});

/* ---------------- listPublicGames ---------------- */

describe("listPublicGames (GET /publicgame/games)", () => {
    it("should return a paginated list of public games", async () => {
        const mockTemplates = [
            {
                id: 1,
                gameTopic: "Test Topic",
                difficulty: "A1" as EnglishLevel,
                imageUrl: "test.jpg",
                gameCode: "ABCDE",
                isPublic: true,
            },
        ];
        prisma.gameTemplate.findMany.mockResolvedValueOnce(mockTemplates);
        prisma.gameTemplate.count.mockResolvedValueOnce(1);

        const req = mockReq({ query: { limit: "10", offset: "0" } });
        const res = mockRes();

        await listPublicGames(req as any, res as any, jest.fn());

        expect(prisma.gameTemplate.findMany).toHaveBeenCalledWith({
            where: { isPublic: true },
            select: {
                id: true,
                gameTopic: true,
                difficulty: true,
                imageUrl: true,
                gameCode: true,
                isPublic: true,
            },
            orderBy: { id: "desc" },
            take: 10,
            skip: 0,
        });
        expect(prisma.gameTemplate.count).toHaveBeenCalledWith({
            where: { isPublic: true },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            total: 1,
            items: [
                {
                    id: 1,
                    title: "Test Topic",
                    gameType: "WORD_SEARCH",
                    difficulty: "A1",
                    imageUrl: "test.jpg",
                    gameCode: "ABCDE",
                    isPublic: true,
                },
            ],
        });
    });

    it("should use default pagination values if query params are invalid", async () => {
        prisma.gameTemplate.findMany.mockResolvedValueOnce([]);
        prisma.gameTemplate.count.mockResolvedValueOnce(0);

        const req = mockReq({ query: { limit: "invalid", offset: "invalid" } });
        const res = mockRes();

        await listPublicGames(req as any, res as any, jest.fn());

        expect(prisma.gameTemplate.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 20,
                skip: 0,
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 500 on a database error", async () => {
        prisma.gameTemplate.findMany.mockRejectedValueOnce(new Error("DB Error"));

        const req = mockReq({ query: {} });
        const res = mockRes();

        await listPublicGames(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

/* ---------------- startPublicGame ---------------- */

describe("startPublicGame (POST /publicgame/games/:templateId/start)", () => {
    const baseGame = {
        id: 101,
        startedAt: new Date(),
        finishedAt: null,
        isHintUsed: false,
        isFinished: false,
        timer: null,
    };

    const PUBLIC_TEMPLATE = {
        id: 1,
        isPublic: true,
        gameTopic: "Topic",
        difficulty: "A1" as EnglishLevel,
        imageUrl: "img.jpg",
        gameCode: "ABCDE",
    };

    const PRIVATE_TEMPLATE = {
        ...PUBLIC_TEMPLATE,
        id: 2,
        isPublic: false,
        gameCode: "PRIV1",
    };

    it("should 401 if user is not authenticated", async () => {
        const req = mockReq({ params: { templateId: "1" }, body: {} });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should 400 if templateId is invalid", async () => {
        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "abc" },
            body: {},
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid templateId" });
    });

    it("should 404 if template is not found", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(null);

        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "999" },
            body: {},
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Template not found" });
    });

    it("should 403 if template is private (teacher mode)", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PRIVATE_TEMPLATE);

        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "2" },
            body: {},
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Template not public" });
    });

    it("should 201 and create a game with default WORD_SEARCH and no timer", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce(baseGame);

        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "1" },
            body: {},
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    userId: 1,
                    gameTemplateId: 1,
                    gameType: "WORD_SEARCH",
                    timer: null,
                },
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                id: baseGame.id,
                templateId: PUBLIC_TEMPLATE.id,
                gameType: "WORD_SEARCH",
                timer: null,
            })
        );
    });

    it("should create a game with specified gameType and timerSeconds", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce({
            ...baseGame,
            gameType: "CROSSWORD_SEARCH",
            timer: 300,
        });

        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "1" },
            body: { newType: "CROSSWORD_SEARCH", timerSeconds: 300 },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    userId: 1,
                    gameTemplateId: 1,
                    gameType: "CROSSWORD_SEARCH",
                    timer: 300,
                },
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ gameType: "CROSSWORD_SEARCH", timer: 300 })
        );
    });

    it("should correctly use legacy timerMinutes and convert to seconds", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce({ ...baseGame, timer: 420 });

        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "1" },
            body: { timerMinutes: 7 },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ timer: 420 }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should prefer timerSeconds over timerMinutes", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce({ ...baseGame, timer: 300 });

        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "1" },
            body: { timerSeconds: 300, timerMinutes: 7 },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ timer: 300 }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should pass through unknown newType strings and ignore invalid timerSeconds", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce(baseGame);

        const req = mockReq({
            user: { id: 11 },
            params: { templateId: "1" },
            body: { newType: "INVALID_TYPE" as any, timerSeconds: "abc" as any },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: 11,
                    gameTemplateId: 1,
                    gameType: "INVALID_TYPE",
                    timer: null,
                }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should parse numeric strings in timerSeconds", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce({ ...baseGame, timer: 180 });

        const req = mockReq({
            user: { id: 22 },
            params: { templateId: "1" },
            body: { timerSeconds: "180" as any },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ timer: 180 }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should clamp negative timerSeconds to 0", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce({ ...baseGame, timer: 0 });

        const req = mockReq({
            user: { id: 5 },
            params: { templateId: "1" },
            body: { timerSeconds: -10 },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ timer: 0 }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should accept 0 seconds when timerSeconds is '0'", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockResolvedValueOnce({ ...baseGame, timer: 0 });

        const req = mockReq({
            user: { id: 8 },
            params: { templateId: "1" },
            body: { timerSeconds: "0" as any },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(prisma.game.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ timer: 0 }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 500 when DB create fails", async () => {
        prisma.gameTemplate.findUnique.mockResolvedValueOnce(PUBLIC_TEMPLATE);
        prisma.game.create.mockRejectedValueOnce(new Error("DB Error"));

        const req = mockReq({
            user: { id: 9 },
            params: { templateId: "1" },
            body: { timerSeconds: 60 },
        });
        const res = mockRes();

        await startPublicGame(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

/* ---------------- checkPublicGamePlayed ---------------- */

describe("checkPublicGamePlayed (GET /publicgame/games/:templateId/played)", () => {
    it("should 401 if user is not authenticated", async () => {
        const req = mockReq({ params: { templateId: "1" }, query: {} });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should 400 if templateId is invalid", async () => {
        const req = mockReq({
            user: { id: 1 },
            params: { templateId: "abc" },
            query: {},
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid templateId" });
    });

    it("should return { alreadyPlayed: true } if a matching game exists", async () => {
        prisma.game.count.mockResolvedValueOnce(1);

        const req = mockReq({
            user: { id: 7 },
            params: { templateId: "10" },
            query: { newType: "CROSSWORD_SEARCH", timerSeconds: "300" },
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith({
            where: {
                userId: 7,
                gameTemplateId: 10,
                gameType: "CROSSWORD_SEARCH",
                timer: 300,
            },
        });
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: true });
    });

    it("should return { alreadyPlayed: false } if no matching game exists", async () => {
        prisma.game.count.mockResolvedValueOnce(0);

        const req = mockReq({
            user: { id: 2 },
            params: { templateId: "5" },
            query: {},
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith({
            where: {
                userId: 2,
                gameTemplateId: 5,
                gameType: "WORD_SEARCH",
                timer: null,
            },
        });
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: false });
    });

    it("should correctly check using legacy timerMinutes", async () => {
        prisma.game.count.mockResolvedValueOnce(1);

        const req = mockReq({
            user: { id: 3 },
            params: { templateId: "6" },
            query: { timerMinutes: "5" },
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith({
            where: {
                userId: 3,
                gameTemplateId: 6,
                gameType: "WORD_SEARCH",
                timer: 300,
            },
        });
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: true });
    });

    it("should use newType as-is even if invalid and ignore invalid timerSeconds", async () => {
        prisma.game.count.mockResolvedValueOnce(0);

        const req = mockReq({
            user: { id: 33 },
            params: { templateId: "1" },
            query: { newType: "NOT_A_TYPE" as any, timerSeconds: "NaN" as any },
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith({
            where: {
                userId: 33,
                gameTemplateId: 1,
                gameType: "NOT_A_TYPE",
                timer: null,
            },
        });
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: false });
    });

    it("should prefer timerSeconds over timerMinutes in query", async () => {
        prisma.game.count.mockResolvedValueOnce(1);

        const req = mockReq({
            user: { id: 44 },
            params: { templateId: "1" },
            query: { timerSeconds: "120", timerMinutes: "9" },
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ timer: 120 }),
            })
        );
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: true });
    });

    it("should accept 0 seconds when timerSeconds='0'", async () => {
        prisma.game.count.mockResolvedValueOnce(0);

        const req = mockReq({
            user: { id: 55 },
            params: { templateId: "1" },
            query: { timerSeconds: "0" },
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith({
            where: {
                userId: 55,
                gameTemplateId: 1,
                gameType: "WORD_SEARCH",
                timer: 0,
            },
        });
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: false });
    });

    it("should clamp negative timerMinutes to 0", async () => {
        prisma.game.count.mockResolvedValueOnce(0);

        const req = mockReq({
            user: { id: 66 },
            params: { templateId: "1" },
            query: { timerMinutes: "-2" },
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(prisma.game.count).toHaveBeenCalledWith({
            where: {
                userId: 66,
                gameTemplateId: 1,
                gameType: "WORD_SEARCH",
                timer: 0,
            },
        });
        expect(res.json).toHaveBeenCalledWith({ alreadyPlayed: false });
    });

    it("should return 500 when DB count fails", async () => {
        prisma.game.count.mockRejectedValueOnce(new Error("DB Error"));

        const req = mockReq({
            user: { id: 77 },
            params: { templateId: "1" },
            query: {},
        });
        const res = mockRes();

        await checkPublicGamePlayed(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "Internal Server Error",
        });
    });
});

/* ---------------- listPublicGames - extra ---------------- */

describe("listPublicGames - extra cases", () => {
    it("should default to take=20 and skip=0 when limit<=0 or offset<0", async () => {
        prisma.gameTemplate.findMany.mockResolvedValueOnce([]);
        prisma.gameTemplate.count.mockResolvedValueOnce(0);

        const req = mockReq({ query: { limit: "0", offset: "-5" } });
        const res = mockRes();

        await listPublicGames(req as any, res as any, jest.fn());

        expect(prisma.gameTemplate.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 20, skip: 0 })
        );
    });

    it("should map multiple templates to response items", async () => {
        const t1 = {
            id: 3,
            gameTopic: "Another Topic",
            difficulty: "A1" as EnglishLevel,
            imageUrl: "test2.jpg",
            gameCode: "FGHIJ",
            isPublic: true,
        };
        const t2 = {
            id: 1,
            gameTopic: "Test Topic",
            difficulty: "A1" as EnglishLevel,
            imageUrl: "test.jpg",
            gameCode: "ABCDE",
            isPublic: true,
        };
        prisma.gameTemplate.findMany.mockResolvedValueOnce([t1, t2]);
        prisma.gameTemplate.count.mockResolvedValueOnce(2);

        const req = mockReq({ query: { limit: "10", offset: "0" } });
        const res = mockRes();

        await listPublicGames(req as any, res as any, jest.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            total: 2,
            items: [
                {
                    id: 3,
                    title: "Another Topic",
                    gameType: "WORD_SEARCH",
                    difficulty: "A1",
                    imageUrl: "test2.jpg",
                    gameCode: "FGHIJ",
                    isPublic: true,
                },
                {
                    id: 1,
                    title: "Test Topic",
                    gameType: "WORD_SEARCH",
                    difficulty: "A1",
                    imageUrl: "test.jpg",
                    gameCode: "ABCDE",
                    isPublic: true,
                },
            ],
        });
    });
});