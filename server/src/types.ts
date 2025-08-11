export type FoundWordInput = {
  gameId: number;
  userId: number;
  wordData: {
    questionId: number;
    word: string;
    foundAt: Date;
  };
};
