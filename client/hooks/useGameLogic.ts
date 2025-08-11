import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { generateGrid } from "../utils/gridGenerator";
import { useDragGesture } from "../utils/dragGesture";
import { useFontSizeSettings } from "./useFontSizeSettings";
import { GameState, UseGameLogicProps } from "../types/type";

const initialGameState: GameState = {
  selectedCells: [],
  currentWord: "",
  selectedWord: "",
  isCorrect: null,
  foundWords: [],
};

export function useGameLogic({
  GRID_SIZE,
  CELL_SIZE,
  questionsAndAnswers,
  mode,
}: UseGameLogicProps) {
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

  const initializeGame = useCallback(() => {
    const answers = questionsAndAnswers.map((q) => q.answer);
    const { grid, positions } = generateGrid(answers, GRID_SIZE);
    setGrid(grid);
    gridRef.current = grid;
    answerPositionsRef.current = positions;
    setGameState(initialGameState);
    setHintCell(null);
    setRevealedAnswers([]);
    setActiveHintWord(null);
  }, [questionsAndAnswers, GRID_SIZE]);

  const showHintForAnswer = useCallback(
    (answer: string) => {
      if (mode === "wordsearch") {
        const positions = answerPositionsRef.current[answer];
        if (positions?.length) {
          setHintCell(positions[0]);
          setActiveHintWord(answer);
        }
      } else if (mode === "crossword_search") {
        if (!revealedAnswers.includes(answer)) {
          setRevealedAnswers((prev) => [...prev, answer]);
        }
      }
    },
    [mode, revealedAnswers]
  );

  const onConfirmRestart = useCallback(() => {
    initializeGame();
    setConfirmRestartVisible(false);
  }, [initializeGame]);

  const confirmRestart = useMemo(
    () => ({
      visible: confirmRestartVisible,
      setVisible: setConfirmRestartVisible,
      onConfirm: onConfirmRestart,
    }),
    [confirmRestartVisible, onConfirmRestart]
  );

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const panResponder = useDragGesture({
    GRID_SIZE,
    CELL_SIZE,
    gridRef,
    layoutRef,
    gameState,
    setGameState,
    questionsAndAnswers,
  });

  useEffect(() => {
    if (!activeHintWord) return;

    const isFound = gameState.foundWords.some(
      (fw) => fw.word === activeHintWord
    );
    if (isFound) setActiveHintWord(null);
  }, [gameState.foundWords, activeHintWord]);

  return {
    grid,
    layoutRef,
    panResponder,
    hintCell,
    fontSettings,
    confirmRestart,
    resetGame: onConfirmRestart,
    showHintForAnswer,
    revealedAnswers,
    activeHintWord,
    mode,
    selectedCells: gameState.selectedCells,
    currentWord: gameState.currentWord,
    selectedWord: gameState.selectedWord,
    foundWords: gameState.foundWords,
    isCorrect: gameState.isCorrect,
  };
}
