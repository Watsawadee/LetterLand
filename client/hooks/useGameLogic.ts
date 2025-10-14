import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { generateGrid } from "../utils/gridGenerator";
import { useDragGesture } from "../utils/dragGesture";
import { useFontSizeSettings } from "./useFontSizeSettings";
import { QuestionAnswer, GameState, UseGameLogicProps } from "@/types/type";
export type FoundWord = { word: string; cells: [number, number][] };

const initialGameState: GameState = {
  selectedCells: [],
  currentWord: "",
  selectedWord: "",
  isCorrect: null,
  foundWords: [],
};

export function useGameLogic(rawConfig: UseGameLogicProps) {
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

  const answers = useMemo(
    () => questionsAndAnswers.map((q) => q.answer.toUpperCase().trim()),
    [questionsAndAnswers]
  );

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
    (answer: string, yellowOnly?: boolean) => {
      const target = answer.toUpperCase().trim();
      if (mode === "WORD_SEARCH") {
        const positions = answerPositionsRef.current[target];
        if (positions?.length) {
          setHintCell(positions[0]);
          setActiveHintWord(target);
        }
      } else if (mode === "CROSSWORD_SEARCH") {
        if (yellowOnly) {
          const positions = answerPositionsRef.current[target];
          if (positions?.length) {
            setHintCell(positions[0]);
            setActiveHintWord(target);
          }
        } else {
          if (!revealedAnswers.includes(target)) {
            setRevealedAnswers((prev) => [...prev, target]);
          }
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
    questionsAndAnswers:  questionsAndAnswers.map((q) => ({
        ...q,
        answer: q.answer.trim().toUpperCase(),
      })),
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
