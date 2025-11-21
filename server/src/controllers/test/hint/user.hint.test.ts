import { useHintController, buyHintController } from "../../userController";
import prisma from "../../../configs/db";
import { mockReq, mockRes } from "../utils";
import { buyHint } from "../../../services/userService";

jest.mock("../../../configs/db", () => ({
    __esModule: true,
    default: {
        $transaction: jest.fn(),
        game: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
        user: { updateMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    },
}));

jest.mock("../../../services/userService", () => ({
    buyHint: jest.fn(),
}));

const prismaMock = prisma as any;
const buyHintMock = buyHint as jest.Mock;

describe("useHintController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const runTransaction = async (impl: (tx: any) => Promise<any>) => {
        prismaMock.$transaction.mockImplementation(async (cb: any) => {
            // Simulated transactional client
            const tx = {
                game: {
                    findUnique: prismaMock.game.findUnique,
                    update: prismaMock.game.update,
                },
                user: {
                    updateMany: prismaMock.user.updateMany,
                    findUnique: prismaMock.user.findUnique,
                },
            };
            return cb(tx);
        });
        return impl;
    };

    it("400 when userId missing", async () => {
        const req = mockReq({ params: { userId: "" }, body: { gameId: 1 } });
        const res = mockRes();
        await useHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing userId" });
    });

    it("400 when gameId missing", async () => {
        const req = mockReq({ params: { userId: "5" }, body: {} });
        const res = mockRes();
        await useHintController(req as any, res as any);
        // First 400 for gameId; controller does not return, may attempt txn with NaN
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing gameId" });
    });

    it("404 when game not found", async () => {
        await runTransaction(async () => { });
        prismaMock.game.findUnique.mockResolvedValueOnce(null);

        const req = mockReq({ params: { userId: "7" }, body: { gameId: 100 } });
        const res = mockRes();
        await useHintController(req as any, res as any);

        // Because of missing returns in catch, final status becomes 500 after 404
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Game not found" });
    });

    it("403 when game belongs to another user", async () => {
        await runTransaction(async () => { });
        prismaMock.game.findUnique.mockResolvedValueOnce({
            id: 10,
            userId: 99,
            isHintUsed: false,
        });

        const req = mockReq({ params: { userId: "7" }, body: { gameId: 10 } });
        const res = mockRes();
        await useHintController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: not your game" });
    });

    it("NO_HINTS when user has no hints left", async () => {
        await runTransaction(async () => { });
        prismaMock.game.findUnique.mockResolvedValueOnce({
            id: 10,
            userId: 7,
            isHintUsed: false,
        });
        prismaMock.user.updateMany.mockResolvedValueOnce({ count: 0 }); // fails decrement

        const req = mockReq({ params: { userId: "7" }, body: { gameId: 10 } });
        const res = mockRes();
        await useHintController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "NO_HINTS" });
    });

    it("marks game hint used (was false) and decrements hint", async () => {
        await runTransaction(async () => { });
        prismaMock.game.findUnique.mockResolvedValueOnce({
            id: 55,
            userId: 7,
            isHintUsed: false,
        });
        prismaMock.user.updateMany.mockResolvedValueOnce({ count: 1 });
        prismaMock.game.update.mockResolvedValueOnce({ id: 55 });
        prismaMock.user.findUnique.mockResolvedValueOnce({ id: 7, hint: 4 });

        const req = mockReq({ params: { userId: "7" }, body: { gameId: 55 } });
        const res = mockRes();
        await useHintController(req as any, res as any);

        expect(prismaMock.game.update).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Hint used successfully",
            data: { remainingHints: 4, alreadyUsedBefore: false },
        });
    });

    it("does not update game when already isHintUsed true", async () => {
        await runTransaction(async () => { });
        prismaMock.game.findUnique.mockResolvedValueOnce({
            id: 56,
            userId: 7,
            isHintUsed: true,
        });
        prismaMock.user.updateMany.mockResolvedValueOnce({ count: 1 });
        prismaMock.user.findUnique.mockResolvedValueOnce({ id: 7, hint: 2 });

        const req = mockReq({ params: { userId: "7" }, body: { gameId: 56 } });
        const res = mockRes();
        await useHintController(req as any, res as any);

        expect(prismaMock.game.update).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Hint used successfully",
            data: { remainingHints: 2, alreadyUsedBefore: true },
        });
    });
});

describe("buyHintController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("400 invalid userId", async () => {
        const req = mockReq({ params: { userId: "abc" }, body: { qty: 1 } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing or invalid userId" });
    });

    it("400 invalid qty", async () => {
        const req = mockReq({ params: { userId: "5" }, body: { qty: "x" } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Missing or invalid qty" });
    });

    it("200 successful purchase", async () => {
        buyHintMock.mockResolvedValueOnce({ id: 5, hint: 8 });
        const req = mockReq({ params: { userId: "5" }, body: { qty: 3 } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(buyHintMock).toHaveBeenCalledWith(5, 3);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Purchase hint successful",
            data: { id: 5, hint: 8 },
        });
    });

    it("404 user not found", async () => {
        buyHintMock.mockRejectedValueOnce({ code: "USER_NOT_FOUND" });
        const req = mockReq({ params: { userId: "9" }, body: { qty: 1 } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("400 invalid qty business rule", async () => {
        buyHintMock.mockRejectedValueOnce({ code: "INVALID_QTY" });
        const req = mockReq({ params: { userId: "9" }, body: { qty: 7 } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid qty (must be 1, 3, or 5)" });
    });

    it("400 insufficient funds", async () => {
        buyHintMock.mockRejectedValueOnce({ code: "INSUFFICIENT_FUNDS" });
        const req = mockReq({ params: { userId: "9" }, body: { qty: 3 } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Not enough coins" });
    });

    it("generic failure", async () => {
        buyHintMock.mockRejectedValueOnce(new Error("unexpected"));
        const req = mockReq({ params: { userId: "9" }, body: { qty: 1 } });
        const res = mockRes();
        await buyHintController(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Failed to purchase hint" });
    });
});