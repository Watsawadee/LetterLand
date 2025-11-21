import { mockReq, mockRes } from "./utils";

const mockVocabJson = JSON.stringify([
    { headword: "apple", CEFR: "A1" },
    { headword: "banana", CEFR: "A2" },
    { headword: "cherry", CEFR: "B1" },
    { headword: "durian", CEFR: "B2" },
    { headword: "elderberry", CEFR: "C1" },
    { headword: "ice cream/ice-cream", CEFR: "C2" }
]);

jest.mock("fs", () => ({
    readFileSync: jest.fn(() => mockVocabJson),
}));
jest.mock("path", () => ({
    join: (...args: string[]) => args.join("/"),
}));

const mockSetupReqSafeParse = jest.fn();
jest.mock("../../types/setup.schema", () => ({
    ErrorResponseSchema: { safeParse: (v: any) => ({ success: true, data: v }) },
    SetupProfileRequestSchema: { safeParse: (data: any) => mockSetupReqSafeParse(data) },
    SetupProfileResponseSchema: { parse: (v: any) => v },
}));

jest.mock("../../configs/db", () => ({
    __esModule: true,
    default: {
        user: {
            update: jest.fn(),
        },
    },
}));

jest.mock("../../services/cefrScoreService", () => ({
    calculateCEFRLevelFromSelectedWords: jest.fn(),
}));

import { getWords, setupProfile } from "../setupProfileController";

const prisma = require("../../configs/db").default;
const { calculateCEFRLevelFromSelectedWords } = require("../../services/cefrScoreService");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("getWords", () => {
    it("returns 200 with a list of headwords derived from vocab file", async () => {
        const req = mockReq();
        const res = mockRes();

        await getWords(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const payload = res.status().json.mock.calls[0][0];
        expect(Array.isArray(payload.headwords)).toBe(true);
        // With our dataset, we expect up to 6 unique headwords selected
        expect(payload.headwords.length).toBeGreaterThan(0);
        expect(payload.headwords).toEqual(
            expect.arrayContaining(["apple", "banana", "cherry", "durian", "elderberry", "ice cream/ice-cream"])
        );
    });
});

describe("setupProfile", () => {
    it("400 when request validation fails", async () => {
        mockSetupReqSafeParse.mockReturnValueOnce({ success: false, error: { issues: [] } });

        const req = mockReq({ body: {} });
        const res = mockRes();
        await setupProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith({ error: "Missing or invalid required field." });
    });

    it("400 when no headwords map to CEFR levels", async () => {
        mockSetupReqSafeParse.mockReturnValueOnce({
            success: true,
            data: { userId: 10, age: 9, selectedHeadwords: ["unknown1", "unknown2"] },
        });

        const req = mockReq();
        const res = mockRes();
        await setupProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.status().json).toHaveBeenCalledWith({
            error: "No valid CEFR levels found for selected headwords.",
        });
    });

    it("200 on success: calculates CEFR, updates user, returns response", async () => {
        mockSetupReqSafeParse.mockReturnValueOnce({
            success: true,
            data: { userId: 42, age: 11, selectedHeadwords: ["Apple", "ICE-CREAM"] },
        });

        calculateCEFRLevelFromSelectedWords.mockReturnValueOnce("B1");
        const updatedUser = {
            id: 42,
            email: "u@test.com",
            username: "user42",
            age: 11,
            englishLevel: "B1",
            password: "x",
            coin: 0,
            hint: 0,
            created_at: new Date(),
            total_playtime: 0,
        };
        prisma.user.update.mockResolvedValueOnce(updatedUser);

        const req = mockReq();
        const res = mockRes();
        await setupProfile(req, res);

        expect(calculateCEFRLevelFromSelectedWords).toHaveBeenCalled();
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 42 },
            data: { age: 11, englishLevel: "B1" },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Setup completed",
                cefrLevel: "B1",
                user: expect.objectContaining({ id: 42, englishLevel: "B1" }),
            })
        );
    });

    it("500 when prisma update throws", async () => {
        mockSetupReqSafeParse.mockReturnValueOnce({
            success: true,
            data: { userId: 7, age: 8, selectedHeadwords: ["banana"] },
        });

        calculateCEFRLevelFromSelectedWords.mockReturnValueOnce("A2");
        prisma.user.update.mockRejectedValueOnce(new Error("DB down"));

        const req = mockReq();
        const res = mockRes();
        await setupProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});