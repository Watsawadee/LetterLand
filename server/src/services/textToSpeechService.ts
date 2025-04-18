import { speak } from "google-translate-api-x";
import fs from "fs";
import path from "path";

export const generatePronunciation = async (word: string) => {

  const tts = await speak(word, { to: "en" });
  const normalizedWord = word.toLowerCase();

  const soundsDir = path.join(process.cwd(), "assets", "sounds");

  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  const filePath = path.join(soundsDir, `${normalizedWord}.mp3`);
  const fileUrl = `/assets/sounds/${normalizedWord}.mp3`;

  if (fs.existsSync(filePath)) {
    console.log(`${normalizedWord}.mp3 already exists, skipping save.`);
    return fileUrl;
  }

  fs.writeFileSync(filePath, tts, { encoding: "base64" });

  return fileUrl;
};
