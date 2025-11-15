import { getUserCoins } from "../../achievementController";
import prisma from "../../../configs/db";
import { mockReq, mockRes } from "../utils";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn() }
    },
}));

const prismaMock = prisma as any;

describe("getUserCoins", () => {
    beforeEach(() => jest.clearAllMocks());

    it("401 when no auth", async () => {
        const req = mockReq();
        const res = mockRes();
        await getUserCoins(req as any, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("404 when user not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserCoins(req as any, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("200 returns coins", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ coin: 50 });

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserCoins(req as any, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "User coins",
            data: { coins: 50 },
        });
    });

    it("500 on error", async () => {
        prismaMock.user.findUnique.mockRejectedValue(new Error("fail"));

        const req = mockReq({ user: { id: 1 } });
        const res = mockRes();

        await getUserCoins(req as any, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
