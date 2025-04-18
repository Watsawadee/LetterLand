import { Request, Response } from "express";
import { extractData } from "../services/extractDataService";

export const GeminiAPI = async (req: Request, res: Response) => {
  const { inputData, type } = req.body;

  try {
    const data = await extractData(inputData, type);
    console.log("Extracted data:", data);
    // Next step is send Propmt to gemini API

    res.status(200).json({
      message: "Create Gemini Prompt successfully",
      data: data,
    });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ message: "Failed to Create Gemini Prompt" });
  }
};
