import { Dispatch, SetStateAction, RefObject } from "react";
import { GestureResponderHandlers } from "react-native";

// SharedGameScreen.tsx
export interface GameProps {
  mode: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  title: string;
  CELL_SIZE: number;
  GRID_SIZE: number;
  questionsAndAnswers: QuestionAnswer[];
  gameData: GameData;
}

export interface GameData {
  id: number;
  userId: number;
  gameType: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  gameTemplateId: number;
  startedAt: string;
  finishedAt: string | null;
  isHintUsed: boolean;
  isFinished: boolean;
  timer: number | null;
  gameTemplate: GameTemplate;
}

export interface GameTemplate {
  id: number;
  gameTopic: string;
  difficulty: string;
  isPublic: boolean;
  questions: QuestionAnswer[];
  gameCode: string | null;
  imageUrl?: string;
}

// gameData.ts
export interface QuestionAnswer {
  id: number;
  name: string;
  answer: string;
  hint: string;
  audioUrl: string | null;
}

// GameControls.tsx
export type GameControlsProps = {
  title: string;
  onShowHint: () => void;
  hintCount: number | null;
  isHintDisabled: boolean;
  startTimeSeconds: number;
  onTimeUp: () => void;
  paused?: boolean;
  resetKey?: unknown;
  onOpenHintShop?: () => void;
  refreshHints?: () => void;
  onRequestBuyHints?: () => void;
  gameCode?: string | null;
  cefr?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | string;
};

export interface ConfirmRestartGroup {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onConfirm: () => void;
}

// ConfirmModal.tsx
export interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

// FontSizeModal.tsx
export interface FontSizeModalProps {
  visible: boolean;
  tempFontSize: number;
  setTempFontSize: (size: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

// GameBoard.tsx
export interface GameBoardProps {
  grid: string[][];
  CELL_SIZE: number;
  selectedCells: [number, number][];
  foundWords: FoundWord[];
  hintCell: [number, number] | null;
  hintTargetWord?: string;
  fontSize: number;
  panHandlers: GestureResponderHandlers;
  layoutRef: React.RefObject<LayoutMeta>;
}

export interface LayoutMeta {
  x: number;
  y: number;
  pitch?: number;
  cellSize?: number;
  margin?: number;
}

export interface FoundWord {
  word: string;
  cells: [number, number][];
}

// QuestionListSlider.tsx
export type QuestionListSliderProps = {
  questionsAndAnswers: QuestionAnswer[];
  foundWords: string[];
  showQuestion: boolean;
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  revealedAnswers?: string[];
};

// UseGameLogic.ts
export interface UseGameLogicProps {
  GRID_SIZE: number;
  CELL_SIZE: number;
  questionsAndAnswers: QuestionAnswer[];
  mode: "WORD_SEARCH" | "CROSSWORD_SEARCH";
}

// useDragGesture.ts
export type GameState = {
  selectedCells: [number, number][];
  currentWord: string;
  selectedWord: string;
  isCorrect: boolean | null;
  foundWords: { word: string; cells: [number, number][] }[];
};

export type DragGestureConfig = {
  GRID_SIZE: number;
  CELL_SIZE: number;
  gridRef: RefObject<string[][]>;
  layoutRef: RefObject<LayoutMeta>;
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  questionsAndAnswers: QuestionAnswer[];
};

// WordCard.tsx
export type WordCardProps = {
  word: string;
  found: boolean;
};

// useHints.ts
export type UseHintsArgs = {
  mode: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  questionsAndAnswers: QuestionAnswer[];
  foundWordsList: string[];
  revealedAnswers: string[];
  activeQuestionIndex: number;
  showHintForAnswer: (answer: string) => void;
  initialHints?: number;
};

export type CluesProps = {
  mode: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  questionsAndAnswers: QuestionAnswer[];
  foundWordsList: string[];
  revealedAnswers: string[];
  activeIndex: number;
  onChangeIndex: (i: number) => void;
};

// gameService.ts
export type UserData = {
  id: number;
  username: string;
  email: string;
  age: number | null;
  englishLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  coin: number;
  hint: number;
  created_at: string;
  total_playtime: number;
};
