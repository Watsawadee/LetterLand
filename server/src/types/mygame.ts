export interface GetUserGamesResponse {
  total: number;
  items: {
    id: number;
    isFinished: boolean;
    isHintUsed: boolean;
    startedAt: string | Date;
    finishedAt: string | Date | null;
    gameCode: string | null;
    timer: number | null;
    templateId: number;
    title: string;
    gameType: "WORD_SEARCH" | "CROSSWORD_SEARCH"; 
    difficulty: string;
    imageUrl: string | null;
  }[];
}