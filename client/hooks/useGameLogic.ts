// hooks/useGameLogic.ts
// Purpose: Provide grid state, selection state, and actions for the game.
// Notes:
// - API uses a single config object to avoid long prop lists downstream.
// - Zod-ready: call `validateConfig` at the boundary when you add Zod later.

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { generateGrid } from "../utils/gridGenerator";
import { useDragGesture } from "../utils/dragGesture";
import { useFontSizeSettings } from "./useFontSizeSettings";

export type FoundWord = { word: string; cells: [number, number][] };

export type GameState = {
  selectedCells: [number, number][];
  currentWord: string;
  selectedWord: string;
  isCorrect: boolean | null;
  foundWords: FoundWord[];
};

const initialGameState: GameState = {
  selectedCells: [],
  currentWord: "",
  selectedWord: "",
  isCorrect: null,
  foundWords: [],
};

export type QA = { answer: string; question?: string };
export type Mode = "WORD_SEARCH" | "CROSSWORD_SEARCH";

export type UseGameLogicConfig = {
  GRID_SIZE: number;
  CELL_SIZE: number;
  questionsAndAnswers: QA[];
  mode: Mode;
};

// TODO(Zod): Replace with schema validation when ready.
function validateConfig(cfg: UseGameLogicConfig) {
  if (!cfg) throw new Error("useGameLogic: missing config");
  if (typeof cfg.GRID_SIZE !== "number" || typeof cfg.CELL_SIZE !== "number") {
    throw new Error("useGameLogic: GRID_SIZE and CELL_SIZE must be numbers");
  }
  if (!Array.isArray(cfg.questionsAndAnswers) || cfg.questionsAndAnswers.length === 0) {
    throw new Error("useGameLogic: questionsAndAnswers must be a non-empty array");
  }
  if (cfg.mode !== "WORD_SEARCH" && cfg.mode !== "CROSSWORD_SEARCH") {
    throw new Error("useGameLogic: invalid mode");
  }
}

export function useGameLogic(rawConfig: UseGameLogicConfig) {
  validateConfig(rawConfig);
  const { GRID_SIZE, CELL_SIZE, questionsAndAnswers, mode } = rawConfig;

  const [grid, setGrid] = useState<string[][]>([]);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [hintCell, setHintCell] = useState<[number, number] | null>(null);
  const [confirmRestartVisible, setConfirmRestartVisible] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<string[]>([]);
  const [activeHintWord, setActiveHintWord] = useState<string | null>(null);

  const gridRef = useRef<string[][]>([]);
  const layoutRef = useRef({ x: 0, y: 0 });
  const answerPositionsRef = useRef<Record<string, [number, number][]>>({});

  const fontSettings = useFontSizeSettings();

  const answers = useMemo(() => questionsAndAnswers.map((q) => q.answer.toUpperCase().trim()), [questionsAndAnswers]);

  const initializeGame = useCallback(() => {
    const { grid, positions } = generateGrid(answers, GRID_SIZE);
    setGrid(grid);
    gridRef.current = grid;
    answerPositionsRef.current = positions;
    setGameState(initialGameState);
    setHintCell(null);
    setRevealedAnswers([]);
    setActiveHintWord(null);
  }, [answers, GRID_SIZE]);

  const showHintForAnswer = useCallback(
    (answer: string) => {
      const target = answer.toUpperCase().trim();
      if (mode === "WORD_SEARCH") {
        const positions = answerPositionsRef.current[target];
        if (positions?.length) {
          setHintCell(positions[0]);
          setActiveHintWord(target);
        }
      } else if (mode === "CROSSWORD_SEARCH") {
        if (!revealedAnswers.includes(target)) {
          setRevealedAnswers((prev) => [...prev, target]);
        }
      }
    },
    [mode, revealedAnswers]
  );

  const onConfirmRestart = useCallback(() => {
    initializeGame();
    setConfirmRestartVisible(false);
  }, [initializeGame]);

  const confirmRestart = {
    visible: confirmRestartVisible,
    setVisible: setConfirmRestartVisible,
    onConfirm: onConfirmRestart,
  };

  useEffect(() => {
    if (answers.length) initializeGame();
  }, [initializeGame, answers]);

  const panResponder = useDragGesture({
    GRID_SIZE,
    CELL_SIZE,
    gridRef,
    layoutRef,
    gameState,
    setGameState,
    questionsAndAnswers: questionsAndAnswers.map((q) => ({ ...q, answer: q.answer.toUpperCase().trim() })),
  });

  // Clear hint highlight after the hinted word is found
  useEffect(() => {
    if (!activeHintWord) return;
    const isFound = gameState.foundWords.some((fw) => fw.word === activeHintWord);
    if (isFound) setActiveHintWord(null);
  }, [gameState.foundWords, activeHintWord]);

  return {
    // data for consumers (can be provided via Context to avoid prop drilling)
    grid,
    selectedCells: gameState.selectedCells,
    foundWords: gameState.foundWords,
    hintCell,
    revealedAnswers,
    activeHintWord,
    isCorrect: gameState.isCorrect,
    currentWord: gameState.currentWord,
    selectedWord: gameState.selectedWord,

    // sizing & gestures
    GRID_SIZE,
    CELL_SIZE,
    layoutRef,
    panResponder,

    // controls & settings
    fontSettings,
    confirmRestart,
    resetGame: onConfirmRestart,
    showHintForAnswer,
    mode,
  };
}
