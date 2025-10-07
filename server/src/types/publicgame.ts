// types/publicgame.ts
import { GameType, EnglishLevel } from "@prisma/client";

export type PublicGameItem = {
  id: number;
  title: string;
  gameType: GameType;
  difficulty: EnglishLevel;
  imageUrl: string | null;
  gameCode: string | null; // from GameTemplate
};

export type ListPublicGamesResponse = {
  total: number;
  items: PublicGameItem[];
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
  timer: number | null;      // Int? in Game
  gameCode: string | null;   // from GameTemplate
};
