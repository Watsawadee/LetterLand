export interface GetUserGamesResponse {
    total: number;
    items: {
      id: number;
      isFinished: boolean;
      isHintUsed: boolean;
      startedAt: string | Date;
      finishedAt: string | Date | null;
      gameCode: number | null;
      timer: number | null;
      templateId: number;
      title: string;
      gameType: string;
      difficulty: string;
      imageUrl: string | null;
    }[];
  }