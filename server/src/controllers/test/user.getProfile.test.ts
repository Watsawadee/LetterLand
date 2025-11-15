
import { mockReq, mockRes, resetAll } from "./utils";
import { EnglishLevel } from "@prisma/client";

beforeEach(() => {
    resetAll();

    const prisma = require("../../configs/db").default as {
        user: { findUnique: jest.Mock };
        game: { count: jest.Mock; findMany: jest.Mock };
    };

    prisma.game.findMany.mockResolvedValue([]);
    prisma.game.count.mockResolvedValue(0);
});

jest.mock("../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn() },
        game: { count: jest.fn(), findMany: jest.fn() },
    },
}));

jest.mock("../../types/userProfile.schema", () => ({
    UserProfileResponseSchema: { parse: (v: any) => v },
}));

const mockSecondsBetween = jest.fn((a: Date, b: Date) =>
    Math.max(0, (b.getTime() - a.getTime()) / 1000)
);

jest.mock("../../services/levelupService", () => ({
    getNextLevel: jest.fn(),
    secondsBetween: (a: Date, b: Date) => mockSecondsBetween(a, b),
    startOfISOWeekUTC: jest.fn(),
}));

import { getUserProfile } from "../getUserProfileController";

const prisma = require("../../configs/db").default as {
    user: { findUnique: jest.Mock };
    game: { count: jest.Mock; findMany: jest.Mock };
};

const mockGameFindMany = (
    lastFive: any[],
    currentWeek: any[],
    prevWeek: any[]
) => {
    prisma.game.findMany
        .mockResolvedValueOnce(lastFive)
        .mockResolvedValueOnce(currentWeek)
        .mockResolvedValueOnce(prevWeek);
};

const MOCK_USER = {
    id: 1,
    username: "u",
    coin: 100,
    email: "t@x.com",
    hint: 3,
    englishLevel: "A1" as EnglishLevel,
    total_playtime: 0,
};

describe("getUserProfile - Error and Basic Cases", () => {
    it("401 when no user id", async () => {
        const req = mockReq();
        const res = mockRes();
        await getUserProfile(req as any, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "Unauthorised Access",
        });
    });

    it("404 when user not found", async () => {
        prisma.user.findUnique.mockResolvedValueOnce(null);
        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();
        await getUserProfile(req as any, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "User not found",
        });
    });

    it("500 when prisma throws", async () => {
        prisma.user.findUnique.mockRejectedValueOnce(new Error("db fail"));
        const req = mockReq();
        (req as any).user = { id: 99 };
        const res = mockRes();
        await getUserProfile(req as any, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "Internal server error",
        });
    });

    it("200 happy path with basic data", async () => {
        prisma.user.findUnique.mockResolvedValueOnce(MOCK_USER);
        prisma.game.count.mockResolvedValueOnce(7);

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                username: "u",
                email: "t@x.com",
                coin: 100,
                englishLevel: "A1",
                completedGames: 7,
            })
        );
    });

    it("does not leak password", async () => {
        prisma.user.findUnique.mockResolvedValueOnce({
            ...MOCK_USER,
            password: "secret",
        });

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);
        const body = res.status().json.mock.calls[0][0];
        expect(body.password).toBeUndefined();
    });
});

describe("getUserProfile - canLevelUp Logic", () => {
    type Case = {
        title: string;
        enoughPlaytime: boolean;
        fiveFinished: boolean;
        noHintsUsed: boolean;
        improved: boolean;
        noPrevWeek: boolean;
        expected: boolean;
    };

    const cases: Case[] = [
        {
            title: "all true -> can level up",
            enoughPlaytime: true,
            fiveFinished: true,
            noHintsUsed: true,
            improved: true,
            noPrevWeek: false,
            expected: true,
        },
        {
            title: "not enough playtime -> false",
            enoughPlaytime: false,
            fiveFinished: true,
            noHintsUsed: true,
            improved: true,
            noPrevWeek: false,
            expected: false,
        },
        {
            title: "not five finished -> false",
            enoughPlaytime: true,
            fiveFinished: false,
            noHintsUsed: true,
            improved: true,
            noPrevWeek: false,
            expected: false,
        },
        {
            title: "hints used -> false",
            enoughPlaytime: true,
            fiveFinished: true,
            noHintsUsed: false,
            improved: true,
            noPrevWeek: false,
            expected: false,
        },
        {
            title: "no improvement -> false",
            enoughPlaytime: true,
            fiveFinished: true,
            noHintsUsed: true,
            improved: false,
            noPrevWeek: false,
            expected: false,
        },
        {
            title: "no prev week games -> false",
            enoughPlaytime: true,
            fiveFinished: true,
            noHintsUsed: true,
            improved: true,
            noPrevWeek: true,
            expected: false,
        },
    ];

    it.each(cases)(
        "$title",
        async ({
            enoughPlaytime,
            fiveFinished,
            noHintsUsed,
            improved,
            noPrevWeek,
            expected,
        }) => {
            const totalPlaytime = enoughPlaytime ? 30 * 60 * 60 : 10 * 60 * 60;

            prisma.user.findUnique.mockResolvedValueOnce({
                ...MOCK_USER,
                total_playtime: totalPlaytime,
            });
            prisma.game.count.mockResolvedValueOnce(5);

            const ref = new Date("2025-01-12T12:00:00Z");
            const lastFive = Array.from(
                { length: fiveFinished ? 5 : 4 },
                (_, i) => ({
                    isHintUsed: noHintsUsed ? false : i === 0,
                    startedAt: new Date(ref.getTime() - (i + 1) * 600000),
                    finishedAt: new Date(
                        ref.getTime() - (i + 1) * 600000 + 120000
                    ),
                })
            );

            const currentWeekGames = improved
                ? [
                    {
                        startedAt: new Date("2025-01-10T10:00:00Z"),
                        finishedAt: new Date("2025-01-10T10:02:00Z"),
                    },
                    {
                        startedAt: new Date("2025-01-10T11:00:00Z"),
                        finishedAt: new Date("2025-01-10T11:03:00Z"),
                    },
                ]
                : [
                    {
                        startedAt: new Date("2025-01-10T10:00:00Z"),
                        finishedAt: new Date("2025-01-10T10:06:00Z"),
                    },
                    {
                        startedAt: new Date("2025-01-10T11:00:00Z"),
                        finishedAt: new Date("2025-01-10T11:05:00Z"),
                    },
                ];

            const prevWeekGames = noPrevWeek
                ? []
                : improved
                    ? [
                        {
                            startedAt: new Date("2025-01-03T10:00:00Z"),
                            finishedAt: new Date("2025-01-03T10:06:00Z"),
                        },
                        {
                            startedAt: new Date("2025-01-03T11:00:00Z"),
                            finishedAt: new Date("2025-01-03T11:08:00Z"),
                        },
                    ]
                    : [
                        {
                            startedAt: new Date("2025-01-03T10:00:00Z"),
                            finishedAt: new Date("2025-01-03T10:02:00Z"),
                        },
                        {
                            startedAt: new Date("2025-01-03T11:00:00Z"),
                            finishedAt: new Date("2025-01-03T11:02:30Z"),
                        },
                    ];

            mockGameFindMany(lastFive, currentWeekGames, prevWeekGames);

            const req = mockReq();
            (req as any).user = { id: 1 };
            const res = mockRes();

            await getUserProfile(req as any, res);
            const body = res.status().json.mock.calls[0][0];
            expect(body.canLevelUp).toBe(expected);
        }
    );
});

describe("getUserProfile - progressPercent and nextLevel Logic", () => {
    it("partial progress 15/30h -> 50%", async () => {
        prisma.user.findUnique.mockResolvedValueOnce({
            ...MOCK_USER,
            total_playtime: 15 * 60 * 60,
        });

        mockGameFindMany([], [], []);

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);
        const body = res.status().json.mock.calls[0][0];

        expect(body.progressPercent).toBe(50);
        expect(body.nextLevel).toBe("A2");
    });

    it("99% rule when threshold met but hints used (simulate)", async () => {
        prisma.user.findUnique.mockResolvedValueOnce({
            ...MOCK_USER,
            total_playtime: 31 * 60 * 60,
        });

        const lastFive = [
            { isHintUsed: false },
            { isHintUsed: true },
            { isHintUsed: false },
            { isHintUsed: false },
            { isHintUsed: false },
        ];

        mockGameFindMany(lastFive, [], []);

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);
        const body = res.status().json.mock.calls[0][0];

        expect([99, 100]).toContain(body.progressPercent);
        expect(body.canLevelUp).toBe(false);
    });

    it("max level C2 -> progress 100% and nextLevel stays C2", async () => {
        prisma.user.findUnique.mockResolvedValueOnce({
            ...MOCK_USER,
            englishLevel: "C2",
            total_playtime: 999 * 60 * 60,
        });

        mockGameFindMany([], [], []);

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);
        const body = res.status().json.mock.calls[0][0];

        expect(body.progressPercent).toBe(100);
        expect(body.nextLevel).toBe("C2");
    });

    it("unfinished current week games ignored for improvement", async () => {
        prisma.user.findUnique.mockResolvedValueOnce({
            ...MOCK_USER,
            total_playtime: 30 * 60 * 60,
        });

        const lastFive = [
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T09:00:00Z"),
                finishedAt: new Date("2025-02-09T09:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T10:00:00Z"),
                finishedAt: new Date("2025-02-09T10:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T11:00:00Z"),
                finishedAt: new Date("2025-02-09T11:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T12:00:00Z"),
                finishedAt: new Date("2025-02-09T12:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T13:00:00Z"),
                finishedAt: new Date("2025-02-09T13:02:00Z"),
            },
        ];

        const currentWeek = [
            {
                startedAt: new Date("2025-02-10T10:00:00Z"),
                finishedAt: null,
            },
        ];

        const prevWeek = [
            {
                startedAt: new Date("2025-02-03T10:00:00Z"),
                finishedAt: new Date("2025-02-03T10:06:00Z"),
            },
        ];

        mockGameFindMany(lastFive, currentWeek, prevWeek);

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);
        const body = res.status().json.mock.calls[0][0];

        expect(body.canLevelUp).toBe(false);
    });

    it("improvement true when current avg faster than previous", async () => {
        prisma.user.findUnique.mockResolvedValueOnce({
            ...MOCK_USER,
            total_playtime: 30 * 60 * 60,
        });

        const lastFive = [
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T09:00:00Z"),
                finishedAt: new Date("2025-02-09T09:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T10:00:00Z"),
                finishedAt: new Date("2025-02-09T10:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T11:00:00Z"),
                finishedAt: new Date("2025-02-09T11:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T12:00:00Z"),
                finishedAt: new Date("2025-02-09T12:02:00Z"),
            },
            {
                isHintUsed: false,
                startedAt: new Date("2025-02-09T13:00:00Z"),
                finishedAt: new Date("2025-02-09T13:02:00Z"),
            },
        ];

        const currentWeek = [
            {
                startedAt: new Date("2025-02-10T10:00:00Z"),
                finishedAt: new Date("2025-02-10T10:02:00Z"),
            },
            {
                startedAt: new Date("2025-02-10T11:00:00Z"),
                finishedAt: new Date("2025-02-10T11:02:30Z"),
            },
        ];

        const prevWeek = [
            {
                startedAt: new Date("2025-02-03T10:00:00Z"),
                finishedAt: new Date("2025-02-03T10:06:00Z"),
            },
            {
                startedAt: new Date("2025-02-03T11:00:00Z"),
                finishedAt: new Date("2025-02-03T11:08:00Z"),
            },
        ];

        mockGameFindMany(lastFive, currentWeek, prevWeek);

        const req = mockReq();
        (req as any).user = { id: 1 };
        const res = mockRes();

        await getUserProfile(req as any, res);
        const body = res.status().json.mock.calls[0][0];

        expect(body.canLevelUp).toBe(true);
    });
});
