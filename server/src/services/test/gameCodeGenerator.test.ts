import { generateGameCode } from "../gameCodeGenerator";

const mockFindUnique = jest.fn();

jest.mock("../../configs/db", () => {
    return {
        __esModule: true,
        default: {
            gameTemplate: {
                findUnique: (...args: any[]) => mockFindUnique(...args),
            },
        },
    };
});

const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

describe("generateGameCode", () => {
    beforeEach(() => {
        mockFindUnique.mockReset();
    });

    it("generates a code with the correct length and allowed characters", async () => {
        // DB says: no existing code → only one loop
        mockFindUnique.mockResolvedValueOnce(null);

        const length = 8;
        const code = await generateGameCode(length);

        expect(code).toHaveLength(length);

        // All characters must be in the allowed set
        for (const ch of code) {
            expect(ALLOWED_CHARS.includes(ch)).toBe(true);
        }

        expect(mockFindUnique).toHaveBeenCalledTimes(1);
    });

    it("retries when generated code already exists in the database", async () => {
        // 1st time: code already exists → loop again
        // 2nd time: free code → exit loop
        mockFindUnique
            .mockResolvedValueOnce({ id: 1, gameCode: "ABC123" })
            .mockResolvedValueOnce(null);

        const code = await generateGameCode(6);

        expect(code).toHaveLength(6);
        expect(mockFindUnique).toHaveBeenCalledTimes(2);
    });
});
