export interface GameTemplate {
    id: number;
    gameTopic: string;
    gameType: 'crossword' | 'wordsearch';
    difficulty: string;
    isPublic: boolean;
  }
  
  export interface Game {
    id: number;
    startedAt: string;
    finishedAt: string;
    isHintUsed: boolean;
    isFinished: boolean;
    gameCode: string;
    timer: boolean;
    gameTemplate: GameTemplate;
  }
  
  export interface CardProps {
    id: string;
    image: string;
    title: string;
    subtitle?: string;
    level?: string;
    onPress?: () => void;
  }
  