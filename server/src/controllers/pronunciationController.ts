import { Request, Response } from "express";
import { generatePronunciation } from "../services/textToSpeechService";
import { getFileFromDrive } from "../services/ggDriveService";
import dotenv from "dotenv";

dotenv.config();
const AUDIO_FOLDERID = process.env.AUDIO_FOLDERID!;

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

export const getAudio = async (req: Request, res: Response) => {
  const { fileName } = req.params;
  if (!fileName) return res.status(400).json({ message: "fileName is required" });

  try {
    const file = await getFileFromDrive(fileName, AUDIO_FOLDERID);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.status(200).json({
      message: "File found",
      url: file.webViewLink || file.webContentLink,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ message: "Failed to fetch file" });
  }
};