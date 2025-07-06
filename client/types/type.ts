import { Dispatch, SetStateAction, RefObject } from "react";
import {
  GestureResponderHandlers,
} from "react-native";

// SharedGameScreen.tsx
export type GameProps = {
  mode: "wordsearch" | "crossword_search";
  title: string;
  CELL_SIZE: number;
  GRID_SIZE: number;
  questionsAndAnswers: QuestionAnswer[];
};

// gameData.ts
export interface QuestionAnswer {
  name: string;
  answer: string;
  hint: string;
}

// GameControls.tsx
export interface GameControlsProps {
  title: string;
  fontSettings: FontSettingsGroup;
  confirmRestart: ConfirmRestartGroup;
  onShowHint: () => void;
  onBackHome: () => void;
  onRetryConfirm: () => void;
}

export interface FontSettingsGroup {
  fontSize: number;
  tempFontSize: number;
  fontModalVisible: boolean;
  setFontSize: (size: number) => void;
  setTempFontSize: (size: number) => void;
  setFontModalVisible: (visible: boolean) => void;
}

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
  fontSize: number;
  panHandlers: GestureResponderHandlers;
  layoutRef: React.RefObject<{ x: number; y: number }>;
}

export interface FoundWord {
  word: string;
  cells: [number, number][];
}

// GameSelectionModal.tsx
export type GameSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: "word" | "crossword") => void;
};

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
  mode: "wordsearch" | "crossword_search";
}

// useDragGesture.ts
export type GameState = {
  selectedCells: [number, number][];
  currentWord: string;
  selectedWord: string;
  isCorrect: boolean | null;
  foundWords: { word: string; cells: [number, number][] }[];
};

export type Params = {
  GRID_SIZE: number;
  CELL_SIZE: number;
  gridRef: RefObject<string[][]>;
  layoutRef: RefObject<{ x: number; y: number }>;
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  questionsAndAnswers: { question: string; answer: string }[];
};

// WordCard.tsx
export type WordCardProps = {
  word: string;
  found: boolean;
};
