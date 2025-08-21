import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { uploadToDrive, getFileFromDrive } from "./ggDriveService";

dotenv.config();
const IMAGE_FOLDERID = process.env.IMAGE_FOLDERID!;

export const genImage = async (
  prompt: string,
  style: string,
  aspect_ratio: string,
  seed: string,
  gameId: string,
  gameTopic: string
) => {
  try {
    if (!gameId)
      throw new Error("gameId is required to generate image filename");
    if (!gameTopic) throw new Error("gameTopic is required for filename");

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", style);
    formData.append("aspect_ratio", aspect_ratio);
    formData.append("seed", seed);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${process.env.IMAGINE_API_KEY}`);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };
    const response = await fetch(
      "https://api.vyro.ai/v2/image/generations",
      requestOptions
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response failed:", response.status, errorText);
      throw new Error(`Error: ${errorText}`);
    }

    const sanitizedTopic = gameTopic.toLowerCase().replace(/\s+/g, "_");
    const fileName = `image_${gameId}_${sanitizedTopic}.png`;

    const existingFile = await getFileFromDrive(fileName, IMAGE_FOLDERID);
    if (existingFile) {
      return {
        alreadyExists: true,
        url: existingFile.webViewLink || existingFile.webContentLink || "",
      };
    }
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const filePath = path.join(tmpDir, fileName);
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const fileData = await uploadToDrive(
      filePath,
      fileName,
      IMAGE_FOLDERID,
      "image/png"
    );

    fs.unlinkSync(filePath);

    return {
      alreadyExists: false,
      url: fileData.webViewLink || fileData.webContentLink || "",
    };
  } catch (err) {
    console.error("Error generating image:", err);
    throw new Error("Failed to generate image");
  }
};

export const uploadImage = async (
  filePath: string,
  fileName: string
): Promise<string> => {
  const fileData = await uploadToDrive(
    filePath,
    fileName,
    IMAGE_FOLDERID,
    "image/png"
  );
  fs.unlinkSync(filePath);

  return fileData.webViewLink || fileData.webContentLink || "";
};
