import { Request, Response } from "express";
import { extractData } from "../services/extractDataService";
import { generateCrosswordHints } from "../services/geminiService";

export const GeminiAPI = async (req: Request, res: Response) => {
  const { type, userId, userCEFR } = req.body;

  if (!type || !userId || !userCEFR) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let rawInput: string | Buffer;
    console.log("➡️ Request Type:", type);
    console.log("➡️ userId:", userId);
    console.log("➡️ userCEFR:", userCEFR);
    if (type === "pdf") {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "PDF file is missing" });
      }
      rawInput = req.file.buffer;
    } else if (type === "link") {
      if (!req.body.inputData) {
        return res.status(400).json({ message: "Link is missing" });
      }
      rawInput = req.body.inputData;
    } else {
      return res.status(400).json({ message: "Unsupported type" });
    }

    const data = await extractData(rawInput, type);
    const extractedText = typeof data === "string" ? data : data.content;

    const game = await generateCrosswordHints(
      extractedText,
      Number(userId),
      userCEFR
    );

    res.status(200).json({
      message: "Create Gemini Prompt successfully",
      game,
    });
  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    res.status(500).json({
      message: "Failed to generate Gemini prompt",
      error: error.message || error,
    });
  }
};
