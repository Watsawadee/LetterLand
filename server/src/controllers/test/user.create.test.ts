import { mockReq, mockRes, resetAll } from "./utils";

beforeEach(() => resetAll());

jest.mock("../../types/auth.schema", () => ({
    RegisterRequestSchema: {
        safeParse: jest.fn(() => ({ success: true, data: { email: "t@x.com", username: "u", password: "pw" } })),
    },
    RegisterResponseSchema: { parse: (v: any) => v },
}));

jest.mock("../../configs/db", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock("bcrypt", () => ({ hash: jest.fn(() => Promise.resolve("hashed")) }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn(() => "JWT_TOKEN") }));

const db = require("../../configs/db").default;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("createUserController", () => {
    it("returns 409 when user already exists", async () => {
        db.user.findUnique.mockResolvedValue({ id: 1, email: "t@x.com" });
        const { createUserController } = await import("../userController");
        const req = mockReq();
        const res = mockRes();
        await createUserController(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.status().json).toHaveBeenCalledWith({ message: "User account already exists" });
    });

    it("creates user and returns 201 on success", async () => {
        db.user.findUnique.mockResolvedValue(null);
        const fakeUser = {
            id: 10,
            email: "t@x.com",
            username: "u",
            password: "hashed",
            age: 0,
            englishLevel: "A1",
            coin: 0,
            hint: 0,
            created_at: new Date(),
            total_playtime: 0,
        };
        db.user.create.mockResolvedValue(fakeUser);

        const { createUserController } = await import("../userController");
        const req = mockReq();
        const res = mockRes();

        await createUserController(req, res);

        expect(bcrypt.hash).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Successfully created user", token: "JWT_TOKEN" })
        );
    });
});