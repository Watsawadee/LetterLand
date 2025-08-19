import { Request, Response } from "express";
import { generatePronunciation } from "../services/textToSpeechService";

export const pronunciation = async (req: Request, res: Response) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ message: "Word is required" });
  }

  try {
    const fileUrl = await generatePronunciation(word);

    res.status(200).json({
      result: word,
      message: "Audio file generated successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Pronunciation error:", error);
    res.status(500).json({ message: "Failed to generate pronunciation" });
  }
};
