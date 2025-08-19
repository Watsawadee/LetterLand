import { Request, Response } from "express";
import { genImage } from "../services/genImageService";

export const genImageAPI = async (req: Request, res: Response) => {
    const { prompt, style, aspect_ratio, seed } = req.body;

  try {
    const data = await genImage(prompt, style, aspect_ratio, seed);
    res.status(200).json({
      message: "Generate Image successfully",
      data: data,
    });
  } catch (error) {
    console.error("GenImage error:", error);
    res.status(500).json({ message: "Failed to Generate Image" });
  }
};
