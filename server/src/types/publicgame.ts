import { GameType, EnglishLevel } from "@prisma/client";

export type PublicGameItem = {
  id: number;
  title: string;
  gameType: GameType;
  difficulty: EnglishLevel;
  imageUrl: string | null;
  gameCode: string | null;
};

export type ListPublicGamesResponse = {
  total: number;
  items: PublicGameItem[];
};

export type StartPublicGameRequest = {
  /** ถ้าไม่ส่ง จะใช้ type เดิมของ template */
  newType?: GameType;
  /** นาที (>=0). ถ้าไม่ส่ง จะไม่ตั้งค่า timer */
  timerMinutes?: number;
};

export type StartPublicGameResponse = {
  id: number;
  templateId: number;
  title: string;
  gameType: GameType;
  difficulty: EnglishLevel;
  imageUrl: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  isHintUsed: boolean;
  isFinished: boolean;
  /** เก็บเป็นวินาที */
  timer: number | null;
  /** ของ template ที่ถูกใช้จริง (อาจเป็น variant) */
  gameCode: string | null;
};
