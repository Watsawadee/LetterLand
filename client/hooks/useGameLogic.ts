import { useEffect, useRef, useState } from "react";
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

  const gridRef = useRef<string[][]>([]);
  const layoutRef = useRef({ x: 0, y: 0 });
  const answerPositionsRef = useRef<Record<string, [number, number][]>>({});

  const fontSettings = useFontSizeSettings();

  const initializeGame = () => {
    const answers = questionsAndAnswers.map((q) => q.answer);
    const { grid, positions } = generateGrid(answers, GRID_SIZE);
    setGrid(grid);
    gridRef.current = grid;
    answerPositionsRef.current = positions;
    setGameState(initialGameState);
    setHintCell(null);
  };

  const showHintForAnswer = (answer: string) => {
    const pos = answerPositionsRef.current[answer];
    if (pos?.length) {
      setHintCell(null);
      setTimeout(() => setHintCell(pos[0]), 10);
    }
  };

  const confirmRestart = {
    visible: confirmRestartVisible,
    setVisible: setConfirmRestartVisible,
    
    onConfirm: () => {
      initializeGame();
      setConfirmRestartVisible(false);
    },
  };

  useEffect(() => {
    initializeGame();
  }, [questionsAndAnswers, GRID_SIZE]);

  const panResponder = useDragGesture({
    GRID_SIZE,
    CELL_SIZE,
    gridRef,
    layoutRef,
    gameState,
    setGameState,
    questionsAndAnswers,
  });

  return {
    grid,
    layoutRef,
    panResponder,
    hintCell,
    fontSettings,
    confirmRestart,
    resetGame: confirmRestart.onConfirm,
    showHintForAnswer,
    mode,
    selectedCells: gameState.selectedCells,
    currentWord: gameState.currentWord,
    selectedWord: gameState.selectedWord,
    foundWords: gameState.foundWords,
    isCorrect: gameState.isCorrect,
  };
}
