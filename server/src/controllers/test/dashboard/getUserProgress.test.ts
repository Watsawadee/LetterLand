import { getUserProgress } from "../../dashboardController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn() },
        game: { findMany: jest.fn() }
    }
}));

jest.mock("../../../types/dashboard.schema", () => ({
    UserProgressResponseSchema: { parse: (v: any) => v },
}));

const prismaMock = prisma as any;

beforeEach(() => resetAll());

describe("getUserProgress", () => {
    it("401 if no auth", async () => {
        const req = mockReq();
        const res = mockRes();

        await getUserProgress(req as any, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("404 if user not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserProgress(req as any, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("200 computes progress + donut + summary", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            englishLevel: "A1",
            total_playtime: 10 * 3600,
        });
        prismaMock.game.findMany
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValue([]);

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserProgress(req as any, res);

        const json = res.json.mock.calls[0][0];

        expect(json).toHaveProperty("progress");
        expect(json).toHaveProperty("criteria");
        expect(json).toHaveProperty("donut");
        expect(json).toHaveProperty("summary");

        expect(json.progress).toBeGreaterThanOrEqual(0);
    });

    it("500 on Prisma error", async () => {
        prismaMock.user.findUnique.mockRejectedValue(new Error("db fail"));

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserProgress(req as any, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
