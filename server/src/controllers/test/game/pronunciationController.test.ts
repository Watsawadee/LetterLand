import { pronunciation } from "../../pronunciationController";
import { generatePronunciation } from "../../../services/textToSpeechService";
import { mockReq, mockRes } from "../utils";

jest.mock("../../../services/textToSpeechService", () => ({
    generatePronunciation: jest.fn(),
}));

describe("pronunciation controller", () => {
    beforeEach(() => jest.clearAllMocks());

    it("400 when word is missing", async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        await pronunciation(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Word is required" });
    });

    it("200 success returns audio URL", async () => {
        (generatePronunciation as jest.Mock).mockResolvedValue({
            alreadyExists: true,
            url: "https://audio.com/cat.mp3",
        });

        const req = mockReq({ body: { word: "cat" } });
        const res = mockRes();

        await pronunciation(req as any, res as any);

        expect(generatePronunciation).toHaveBeenCalledWith("cat");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            result: "cat",
            message: "Audio file generated successfully",
            url: {
                alreadyExists: true,
                url: "https://audio.com/cat.mp3",
            },
        });
    });

    it("500 on service error", async () => {
        (generatePronunciation as jest.Mock).mockRejectedValue(new Error("fail"));

        const req = mockReq({ body: { word: "cat" } });
        const res = mockRes();

        await pronunciation(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Failed to generate pronunciation",
        });
    });
});