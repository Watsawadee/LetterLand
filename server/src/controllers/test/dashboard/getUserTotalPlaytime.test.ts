import { getUserTotalPlaytime } from "../../dashboardController";
import prisma from "../../../configs/db";
import { mockReq, mockRes, resetAll } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn() }
    }
}));

const prismaMock = prisma as any;

beforeEach(() => {
    jest.clearAllMocks();
    resetAll();
});

describe("getUserTotalPlaytime", () => {
    it("400 if userId is invalid", async () => {
        const req = mockReq({ params: { userId: "abc" }, user: { id: 1 } });
        const res = mockRes();

        await getUserTotalPlaytime(req as any, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("403 if accessing other user", async () => {
        const req = mockReq({ params: { userId: "2" }, user: { id: 1 } });
        const res = mockRes();

        await getUserTotalPlaytime(req as any, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("404 when user not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const req = mockReq({ params: { userId: "1" }, user: { id: 1 } });
        const res = mockRes();

        await getUserTotalPlaytime(req as any, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("200 returns correct playtime", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ total_playtime: 7200 });

        const req = mockReq({ params: { userId: "1" }, user: { id: 1 } });
        const res = mockRes();

        await getUserTotalPlaytime(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith({ totalPlaytime: 2.0 });
    });

    it("500 on prisma error", async () => {
        prismaMock.user.findUnique.mockRejectedValue(new Error("DB fail"));

        const req = mockReq({ params: { userId: "1" }, user: { id: 1 } });
        const res = mockRes();

        await getUserTotalPlaytime(req as any, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
