export type PublicGameType = "WORD_SEARCH" | "CROSSWORD_SEARCH";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface PublicGameItem {
  id: number;
  title: string;
  gameType: PublicGameType;
  difficulty: EnglishLevel;
  imageUrl: string | null;
  gameCode: string | null; 
  isPublic: boolean;   
}

export interface ListPublicGamesResponse {
  total: number;
  items: PublicGameItem[];
}

export interface StartPublicGameResponse {
  id: number;
  templateId: number;
  title: string;
  gameType: PublicGameType;
  difficulty: EnglishLevel;
  imageUrl: string | null;
  startedAt: string | Date;
  finishedAt: string | Date | null;
  isHintUsed: boolean;
  isFinished: boolean;
  gameCode: string | null;   // (you already had this)
  timer: number | null;
}
