import { Request, Response } from "express";
import { genImage } from "../services/genImageService";
import dotenv from "dotenv";
import { getFileFromDrive } from "../services/ggDriveService";
import axios from "axios";

dotenv.config();
const IMAGE_FOLDERID = process.env.IMAGE_FOLDERID!;

export const genImageAPI = async (req: Request, res: Response) => {
  const { prompt, style, aspect_ratio, seed, gameId, gameTopic } = req.body;

  try {
    const data = await genImage(
      prompt,
      style,
      aspect_ratio,
      seed,
      gameId,
      gameTopic
    );
    res.status(200).json({
      message: "Generate Image successfully",
      data: data,
    });
  } catch (error) {
    console.error("GenImage error:", error);
    res.status(500).json({ message: "Failed to Generate Image" });
  }
};

export const getImage = async (req: Request, res: Response) => {
  const { fileName } = req.params;
  if (!fileName) {
    res.status(400).json({ message: "fileName is required" });
    return;
  }

  try {
    const file = await getFileFromDrive(fileName, IMAGE_FOLDERID);

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const fileId = file.id;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", file.mimeType || "image/png");
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching Image:", error);
    res.status(500).json({ message: "Failed to fetch file" });
  }
};
