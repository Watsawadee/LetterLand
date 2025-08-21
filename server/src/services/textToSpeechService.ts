import { speak } from "google-translate-api-x";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getFileFromDrive, uploadToDrive } from "./ggDriveService";

dotenv.config();

const AUDIO_FOLDERID = process.env.AUDIO_FOLDERID!;

export const textToSpeech = async (word: string): Promise<string> => {
  const normalizedWord = word.toLowerCase();
  const tts = await speak(word, { to: "en" });

  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tempFilePath = path.join(tmpDir, `${normalizedWord}.mp3`);
  fs.writeFileSync(tempFilePath, tts, { encoding: "base64" });

  return tempFilePath;
};

export const uploadAudio = async (
  filePath: string,
  fileName: string
): Promise<string> => {
  const fileData = await uploadToDrive(filePath, fileName, AUDIO_FOLDERID);
  fs.unlinkSync(filePath);

  return fileData.webViewLink || fileData.webContentLink || "";
};

export const generatePronunciation = async (word: string) => {
  const fileName = `${word.toLowerCase()}.mp3`;

  const existingFile = await getFileFromDrive(fileName, AUDIO_FOLDERID);
  if (existingFile) {
    return {
      alreadyExists: true,
      url: existingFile.webViewLink || existingFile.webContentLink || "",
    };
  }

  const tempFile = await textToSpeech(word);
  const url = await uploadAudio(tempFile, fileName);

  return {
    alreadyExists: false,
    url,
  };
};
