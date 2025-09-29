import { Request, Response } from "express";
import { generatePronunciation } from "../services/textToSpeechService";
import { getFileFromDrive } from "../services/ggDriveService";
import dotenv from "dotenv";
import axios from "axios";
import { getGameData } from "../services/gameService";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const AUDIO_FOLDERID = process.env.AUDIO_FOLDERID!;

export const pronunciation = async (req: Request, res: Response) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ message: "Word is required" });

  try {
    const fileUrl = await generatePronunciation(word);
    res
      .status(200)
      .json({
        result: word,
        message: "Audio file generated successfully",
        url: fileUrl,
      });
  } catch (error) {
    console.error("Pronunciation error:", error);
    res.status(500).json({ message: "Failed to generate pronunciation" });
  }
};

function normWord(w: string) {
  return String(w || "").trim();
}

function extractDriveIdFromViewer(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  return m?.[1] || null;
}

function toDirectDownloadUrl(url: string): string {
  if (
    /drive\.google\.com\/uc\?/.test(url) ||
    /drive\.usercontent\.google\.com\/uc\?/.test(url)
  ) {
    return url;
  }
  const id = extractDriveIdFromViewer(url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return url;
}

async function fetchUrlAsDataUrl(rawUrl: string): Promise<{
  dataUrl?: string;
  mimeType?: string;
  size?: number;
  error?: string;
}> {
  try {
    const url = toDirectDownloadUrl(rawUrl);
    const resp = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "LetterLand-AudioFetcher/1.0" },
      validateStatus: () => true,
    });
    if (resp.status >= 400) {
      return { error: `Download failed (HTTP ${resp.status})` };
    }

    const mimeHeader = String(resp.headers["content-type"] || "").toLowerCase();
    const mime = mimeHeader.startsWith("audio/") ? mimeHeader : "audio/mpeg";
    const buf = Buffer.from(resp.data as any);
    const base64 = buf.toString("base64");
    return {
      dataUrl: `data:${mime};base64,${base64}`,
      mimeType: mime,
      size: buf.length,
    };
  } catch (e) {
    console.error("URL fetch error:", e);
    return { error: "Failed to fetch from URL" };
  }
}

async function fetchDriveByNameAsDataUrl(fileName: string): Promise<{
  dataUrl?: string;
  mimeType?: string;
  size?: number;
  error?: string;
}> {
  try {
    const file = await getFileFromDrive(fileName, AUDIO_FOLDERID);
    if (!file) return { error: "File not found" };

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
    const resp = await axios.get<ArrayBuffer>(downloadUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "LetterLand-AudioFetcher/1.0" },
      validateStatus: () => true,
    });

    if (resp.status >= 400)
      return { error: `Download failed (HTTP ${resp.status})` };

    const mime =
      file.mimeType && file.mimeType.startsWith("audio/")
        ? file.mimeType
        : "audio/mpeg";

    const buf = Buffer.from(resp.data as any);
    const base64 = buf.toString("base64");
    return {
      dataUrl: `data:${mime};base64,${base64}`,
      mimeType: mime,
      size: buf.length,
    };
  } catch (e) {
    console.error("Drive fetch error:", e);
    return { error: "Failed to fetch file" };
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, label = ""): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout:${label}`)), ms)
    ),
  ]);
}

export const getAudio = async (req: Request, res: Response) => {
  const { gameId } = req.params;
  if (!gameId) return res.status(400).json({ message: "gameId is required" });

  try {
    const gid = Number(gameId);
    const gameData = await getGameData(gid);
    if (!gameData) return res.status(404).json({ message: "Game not found" });

    const [learned, extras] = await Promise.all([
      prisma.wordFound.findMany({
        where: { gameId: gid },
        include: { question: { select: { id: true, answer: true } } },
        orderBy: { foundAt: "asc" },
      }),
      prisma.extraWordFound.findMany({
        where: { gameId: gid },
        orderBy: { foundAt: "asc" },
      }),
    ]);

    // build tasks for learned
    const learnedTasks = learned.map(async (wf) => {
      const answer = normWord(wf.question?.answer ?? "");
      if (!answer) {
        return {
          source: "learned",
          questionId: wf.questionId,
          answer: "",
          error: "Empty answer",
        };
      }
      const fileName = `${answer.toLowerCase()}.mp3`;
      try {
        const fromDrive = await withTimeout(
          fetchDriveByNameAsDataUrl(fileName),
          5000,
          `learned:${answer}`
        );
        return {
          source: "learned",
          questionId: wf.questionId,
          answer,
          fileName,
          mimeType: fromDrive.mimeType,
          size: fromDrive.size,
          dataUrl: fromDrive.dataUrl,
          error: fromDrive.error,
        };
      } catch (e: any) {
        return {
          source: "learned",
          questionId: wf.questionId,
          answer,
          error: e.message,
        };
      }
    });

    // build tasks for extras
    const extraTasks = extras.map(async (ew) => {
      const word = normWord(ew.word);
      if (!word) {
        return {
          source: "extra",
          extraId: ew.id,
          answer: "",
          error: "Empty word",
        };
      }

      try {
        if (ew.audioUrl) {
          const fromUrl = await withTimeout(
            fetchUrlAsDataUrl(ew.audioUrl),
            5000,
            `extra:${word}`
          );
          if (!fromUrl.error && fromUrl.dataUrl) {
            return {
              source: "extra",
              extraId: ew.id,
              answer: word,
              mimeType: fromUrl.mimeType,
              size: fromUrl.size,
              dataUrl: fromUrl.dataUrl,
            };
          }
        }
        const fileName = `${word.toLowerCase()}.mp3`;
        const fromDrive = await withTimeout(
          fetchDriveByNameAsDataUrl(fileName),
          5000,
          `extra:${word}`
        );
        return {
          source: "extra",
          extraId: ew.id,
          answer: word,
          fileName,
          mimeType: fromDrive.mimeType,
          size: fromDrive.size,
          dataUrl: fromDrive.dataUrl,
          error: fromDrive.error,
        };
      } catch (e: any) {
        return {
          source: "extra",
          extraId: ew.id,
          answer: word,
          error: e.message,
        };
      }
    });

    const results = await Promise.all([...learnedTasks, ...extraTasks]);

    res.status(200).json({
      message: "Audio collected",
      results,
      counts: {
        learned: learned.length,
        extras: extras.length,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    res.status(500).json({ message: "Failed to fetch audio file" });
  }
};
