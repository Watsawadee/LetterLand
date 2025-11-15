import { mockReq, mockRes, resetAll } from "./utils";
import { loginUserController } from "../userController";

beforeEach(() => resetAll());

jest.mock("../../types/auth.schema", () => ({
    LoginRequestSchema: {
        safeParse: jest.fn(() => ({ success: true, data: { email: "t@x.com", password: "pw" } })),
    },
    LoginResponseSchema: { parse: (v: any) => v },
}));
jest.mock("../../configs/db", () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn() },
    },
}));
jest.mock("bcrypt", () => ({ compare: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn(() => "JWT_TOKEN") }));

const db = require("../../configs/db").default;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authSchemas = require("../../types/auth.schema");

describe("loginUserController", () => {
    it("returns 401 when user not found", async () => {
        db.user.findUnique.mockResolvedValue(null);
        const req = mockReq();
        const res = mockRes();
        await loginUserController(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 401 when password invalid", async () => {
        db.user.findUnique.mockResolvedValue({
            id: 1,
            email: "t@x.com",
            username: "u",
            password: "hashed",
            age: 0,
            englishLevel: "A1",
            coin: 0,
            hint: 0,
            created_at: new Date(),
            total_playtime: 0,
        });
        bcrypt.compare.mockResolvedValue(false);
        const req = mockReq();
        const res = mockRes();
        await loginUserController(req, res);
        expect(bcrypt.compare).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 200 and token on success", async () => {
        db.user.findUnique.mockResolvedValue({
            id: 2,
            email: "t@x.com",
            username: "u",
            password: "hashed",
            age: 5,
            englishLevel: "A1",
            coin: 10,
            hint: 3,
            created_at: new Date(),
            total_playtime: 100,
        });
        bcrypt.compare.mockResolvedValue(true);
        const req = mockReq();
        const res = mockRes();
        await loginUserController(req, res);
        expect(bcrypt.compare).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({ token: "JWT_TOKEN", message: "LoggedIn Successfully" })
        );
    });

    it("returns 400 on validation failure", async () => {
        (authSchemas.LoginRequestSchema.safeParse as jest.Mock).mockReturnValueOnce({
            success: false,
            error: { format: () => ({ email: { _errors: ["Invalid"] } }) },
        });
        const req = mockReq({ body: {} });
        const res = mockRes();
        await loginUserController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(Object) })
        );
    });
});