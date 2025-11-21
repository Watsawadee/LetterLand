import { getImage } from "../../controllers/genImageController";
import { getFileFromDrive } from "../../services/ggDriveService";
import axios from "axios";
import { mockReq, mockRes } from "../../controllers/test/utils";

jest.mock("../../services/ggDriveService", () => ({
    getFileFromDrive: jest.fn(),
}));

jest.mock("axios");

describe("getImage Controller", () => {
    beforeEach(() => jest.clearAllMocks());

    it("400 when fileName missing", async () => {
        const req = mockReq({ params: {} });
        const res = mockRes();

        await getImage(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "fileName is required" });
    });

    it("404 when file not found in drive", async () => {
        (getFileFromDrive as jest.Mock).mockResolvedValue(null);

        const req = mockReq({ params: { fileName: "abc.png" } });
        const res = mockRes();

        await getImage(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "File not found" });
    });

    it("200 returns the file binary", async () => {
        (getFileFromDrive as jest.Mock).mockResolvedValue({
            id: "FILE123",
            mimeType: "image/png",
        });

        (axios.get as jest.Mock).mockResolvedValue({
            data: Buffer.from("FAKE_IMAGE"),
        });

        const req = mockReq({ params: { fileName: "pic.png" } });
        const res = mockRes();

        await getImage(req as any, res as any);

        expect(axios.get).toHaveBeenCalled();

        // Some controllers use setHeader, others use header/set/type.
        const headerMock =
            (res as any).setHeader ??
            (res as any).header ??
            (res as any).set ??
            (res as any).type;

        expect(jest.isMockFunction(headerMock)).toBe(true);
        expect(headerMock).toHaveBeenCalledWith("Content-Type", "image/png");
        expect(res.send).toHaveBeenCalledWith(Buffer.from("FAKE_IMAGE"));
    });

    it("500 when axios or drive throws error", async () => {
        (getFileFromDrive as jest.Mock).mockRejectedValue(new Error("fail"));

        const req = mockReq({ params: { fileName: "bad.png" } });
        const res = mockRes();

        await getImage(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch file" });
    });
});