import { useEffect, useRef, useState } from "react";
import { generateGrid } from "../utils/gridGenerator"; // your existing grid logic
import { useDragGesture, GameState } from "../utils/dragGesture"; // your existing drag logic
import { QuestionAnswer } from "@/data/gameData"; // your questions and answers type
import { useFontSizeSettings } from "./useFontSizeSettings";

interface UseGameLogicProps {
  GRID_SIZE: number;
  CELL_SIZE: number;
  questionsAndAnswers: QuestionAnswer[];
  mode: "word" | "crossword";
  directionMode?: "4way" | "8way"; // optional, default 8way
}

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
  const gridRef = useRef<string[][]>([]);
  const layoutRef = useRef({ x: 0, y: 0 });
  const answerPositionsRef = useRef<Record<string, [number, number][]> | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Font size settings
  const {
    fontSize,
    tempFontSize,
    fontModalVisible,
    setFontSize,
    setTempFontSize,
    setFontModalVisible,
  } = useFontSizeSettings();

  const [hintCell, setHintCell] = useState<[number, number] | null>(null);
  const [confirmRestartVisible, setConfirmRestartVisible] = useState(false);

  const initializeGame = () => {
    const answers = questionsAndAnswers.map((item) => item.answer);
    const { grid, positions } = generateGrid(answers, GRID_SIZE);
    setGrid(grid);
    gridRef.current = grid;
    answerPositionsRef.current = positions;
    setGameState(initialGameState);
    setHintCell(null);
  };

  const getNextUnfoundAnswer = () =>
    questionsAndAnswers.find(
      (qa) => !gameState.foundWords.some((fw) => fw.word === qa.answer)
    );

  useEffect(() => {
    initializeGame();
  }, [questionsAndAnswers, GRID_SIZE]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const panResponder = useDragGesture({
    GRID_SIZE,
    CELL_SIZE,
    gridRef,
    layoutRef,
    gameState,
    setGameState,
    questionsAndAnswers,
  });

  const showHint = () => {
    const remaining = getNextUnfoundAnswer();
    const pos = remaining && answerPositionsRef.current?.[remaining.answer];
    if (pos?.length) setHintCell(pos[0]);
  };

  const resetGame = () => {
    initializeGame();
    setConfirmRestartVisible(false);
  };

  return {
    grid,
    layoutRef,
    panResponder,
    hintCell,
    fontModalVisible,
    fontSize,
    tempFontSize,
    confirmRestartVisible,
    setFontModalVisible,
    setTempFontSize,
    setFontSize,
    setConfirmRestartVisible,
    resetGame,
    showHint,
    mode,
    selectedCells: gameState.selectedCells,
    currentWord: gameState.currentWord,
    selectedWord: gameState.selectedWord,
    foundWords: gameState.foundWords,
    isCorrect: gameState.isCorrect,
  };
}
