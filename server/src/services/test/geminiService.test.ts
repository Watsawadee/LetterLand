import axios from "axios";
import { mockReq, mockRes, resetAll } from "../../controllers/test/utils";
import { generateCrosswordHints, validateAnswer } from "../geminiService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
    jest.clearAllMocks();
    resetAll();
});

describe("validateAnswer", () => {
    it("returns sanitized uppercase answer when valid", async () => {
        const result = await validateAnswer(" star ", 4);
        expect(result).toBe("STAR");
    });

    it("rejects too long answers", async () => {
        const result = await validateAnswer("TOOLONGWORD", 4);
        expect(result).toBeNull();
    });

    it("rejects non-letter content", async () => {
        const result = await validateAnswer("123!!", 4);
        expect(result).toBeNull();
    });

    it("returns cached result on repeated call", async () => {
        await validateAnswer("moon", 6);
        const cached = await validateAnswer("moon", 6);
        expect(cached).toBe("MOON");
    });
});

describe("generateCrosswordHints", () => {
    it("cleans, parses and formats Gemini output correctly", async () => {
        mockedAxios.post.mockResolvedValue({
            data: {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: `
                                    {
                                        "success": true,
                                        "game": {
                                            "gameTopic": "Space",
                                            "questions": [
                                                {
                                                    "question": "A star explodes",
                                                    "answer": "NOVA",
                                                    "hint": "Gets bright"
                                                },
                                                {
                                                    "question": "Path of a planet",
                                                    "answer": "ORBIT",
                                                    "hint": "Goes around"
                                                },
                                                {
                                                    "question": "Duplicate",
                                                    "answer": "NOVA",
                                                    "hint": "This should be removed"
                                                }
                                            ],
                                            "userId": 1
                                        },
                                        "imagePrompt": "Galaxy artwork"
                                    }
                                    `
                                }
                            ]
                        }
                    }
                ]
            }
        });

        const result = await generateCrosswordHints("space travel", 1, "A2");

        expect(mockedAxios.post).toHaveBeenCalled();

        expect(result.success).toBe(true);
        expect(result.game.gameTopic).toBe("Space");
        expect(result.game.questions.length).toBe(2);
        expect(result.imagePrompt).toBe("Galaxy artwork");
    });

    it("throws error when Gemini returns no candidates", async () => {
        mockedAxios.post.mockResolvedValue({ data: {} });

        await expect(
            generateCrosswordHints("abc", 1, "A2")
        ).rejects.toThrow("Failed to generate crossword hints.");
    });

    it("retries Gemini API when 500 error occurs", async () => {
        mockedAxios.post
            .mockRejectedValueOnce({
                response: { status: 500 }
            })
            .mockResolvedValueOnce({
                data: {
                    candidates: [
                        {
                            content: {
                                parts: [
                                    {
                                        text: `
                                            {"success": true, "game": {"gameTopic":"X","questions":[]}, "imagePrompt":""}
                                        `
                                    }
                                ]
                            }
                        }
                    ]
                }
            });

        const result = await generateCrosswordHints("abc", 1, "A1");

        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        expect(result.success).toBe(true);
    });

    it("throws immediately on 400 error (non-retryable)", async () => {
        mockedAxios.post.mockRejectedValue({
            response: { status: 400 }
        });

        await expect(
            generateCrosswordHints("abc", 1, "A1")
        ).rejects.toThrow("Failed to generate crossword hints.");
    });
});
