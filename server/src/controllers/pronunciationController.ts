import { Request, Response } from "express";
import { generatePronunciation } from "../services/textToSpeechService";
import { getFileFromDrive } from "../services/ggDriveService";
import dotenv from "dotenv";
import axios from "axios";
import { getGameData } from "../services/gameService";

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
  const { gameId } = req.params;
  if (!gameId) {
    return res.status(400).json({ message: "gameId is required" });
  }

  try {
    const gameData = await getGameData(Number(gameId));
    if (!gameData) {
      return res.status(404).json({ message: "Game not found" });
    }

    const questions = gameData.gameTemplate?.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    const results: Array<{
      questionId: number;
      answer: string;
      fileName?: string;
      mimeType?: string;
      size?: number;
      dataUrl?: string;
      error?: string;
    }> = [];

    for (const q of questions) {
      const fileName = `${String(q.answer).trim().toLowerCase()}.mp3`;

      try {
        const file = await getFileFromDrive(fileName, AUDIO_FOLDERID);
        if (!file) {
          results.push({
            questionId: q.id,
            answer: q.answer,
            error: "File not found",
          });
          continue;
        }

        const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;

        const resp = await axios.get<ArrayBuffer>(downloadUrl, {
          responseType: "arraybuffer",
          headers: { "User-Agent": "LetterLand-AudioFetcher/1.0" },
          validateStatus: () => true,
        });

        if (resp.status >= 400) {
          results.push({
            questionId: q.id,
            answer: q.answer,
            error: `Download failed (HTTP ${resp.status})`,
          });
          continue;
        }

        const mime =
          file.mimeType && file.mimeType.startsWith("audio/")
            ? file.mimeType
            : "audio/mpeg";

        const buf = Buffer.from(resp.data as any);
        const base64 = buf.toString("base64");
        const dataUrl = `data:${mime};base64,${base64}`;

        results.push({
          questionId: q.id,
          answer: q.answer,
          fileName,
          mimeType: mime,
          size: buf.length,
          dataUrl,
        });
      } catch (err) {
        console.error("Download error:", err);
        results.push({
          questionId: q.id,
          answer: q.answer,
          error: "Failed to fetch file",
        });
      }
    }

    return res.status(200).json({
      message: "Audio files downloaded",
      results,
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    return res.status(500).json({ message: "Failed to fetch audio file" });
  }
};
