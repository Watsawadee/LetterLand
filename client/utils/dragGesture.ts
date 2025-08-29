// utils/dragGesture.ts
// Purpose: Convert drag gestures into grid cell selections and commit found words.
// Notes:
// - Accepts a single config object (no long prop lists).
// - Ready for future Zod validation at the boundary via `validateConfig`.
// - Direction locks after second cell; ignores non-adjacent moves.

import { useRef } from "react";
import { PanResponder, PanResponderGestureState } from "react-native";

// Minimal shapes to avoid coupling; adjust as needed.
export type FoundWord = { word: string; cells: [number, number][] };
export type GameState = {
  selectedCells: [number, number][];
  currentWord: string;
  selectedWord: string;
  isCorrect: boolean | null;
  foundWords: FoundWord[];
};

export type QA = { answer: string; question?: string };

export type DragGestureConfig = {
  GRID_SIZE: number;
  CELL_SIZE: number;
  gridRef: React.MutableRefObject<string[][]>;
  layoutRef: React.MutableRefObject<{ x: number; y: number }>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  questionsAndAnswers: QA[];
};

// TODO(Zod): Replace with schema validation when ready.
function validateConfig(cfg: DragGestureConfig) {
  if (!cfg || typeof cfg.GRID_SIZE !== "number" || typeof cfg.CELL_SIZE !== "number") {
    throw new Error("useDragGesture: invalid config");
  }
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function useDragGesture(config: DragGestureConfig) {
  validateConfig(config);
  const { GRID_SIZE, CELL_SIZE, gridRef, layoutRef, gameState, setGameState, questionsAndAnswers } = config;

  const dragState = useRef<{
    selected: [number, number][];
    direction: [number, number] | null;
    word: string;
  }>({
    selected: [],
    direction: null,
    word: "",
  });

  const getLetter = (r: number, c: number) => gridRef.current?.[r]?.[c] ?? "";

  const updateSelectionState = (patch: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...patch }));
  };

  const getClosestCell = (gestureState: PanResponderGestureState): [number, number] | null => {
    if (!layoutRef.current) return null;

    const max = GRID_SIZE * CELL_SIZE;
    const touchX = clamp(gestureState.moveX - layoutRef.current.x, 0, max - 0.1);
    const touchY = clamp(gestureState.moveY - layoutRef.current.y, 0, max - 0.1);

    const col = Math.floor(touchX / CELL_SIZE);
    const row = Math.floor(touchY / CELL_SIZE);

    const centerX = col * CELL_SIZE + CELL_SIZE / 2;
    const centerY = row * CELL_SIZE + CELL_SIZE / 2;
    const dx = centerX - touchX;
    const dy = centerY - touchY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > CELL_SIZE / 2) return null;

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
    return [row, col];
  };

  const isAdjacent = (a: [number, number], b: [number, number]) => {
    const [ar, ac] = a;
    const [br, bc] = b;
    return Math.max(Math.abs(ar - br), Math.abs(ac - bc)) === 1;
  };

  const isNextCellValid = (
    lastCell: [number, number],
    nextCell: [number, number],
    direction: [number, number]
  ) => {
    const [lr, lc] = lastCell;
    const [nr, nc] = nextCell;
    const [dr, dc] = direction;
    return nr === lr + dr && nc === lc + dc;
  };

  const beginSelection = (r: number, c: number) => {
    const letter = getLetter(r, c);
    if (!letter) return;

    dragState.current.selected = [[r, c]];
    dragState.current.direction = null;
    dragState.current.word = letter;

    updateSelectionState({
      selectedCells: [[r, c]],
      currentWord: letter,
      selectedWord: letter,
      isCorrect: null,
    });
  };

  const extendSelection = (r: number, c: number) => {
    const letter = getLetter(r, c);
    if (!letter) return;

    const selected = dragState.current.selected;

    if (selected.length === 1) {
      const [pr, pc] = selected[0];
      if (!isAdjacent([pr, pc], [r, c])) return;
      dragState.current.direction = [r - pr, c - pc];
    } else if (dragState.current.direction) {
      const [lastR, lastC] = selected[selected.length - 1];
      if (!isNextCellValid([lastR, lastC], [r, c], dragState.current.direction)) return;
    }

    dragState.current.selected.push([r, c]);
    dragState.current.word += letter;

    updateSelectionState({
      selectedCells: [...dragState.current.selected],
      currentWord: dragState.current.word,
      selectedWord: dragState.current.word,
      isCorrect: null,
    });
  };

  const commitSelection = () => {
    const { selected, word } = dragState.current;
    const isFound = questionsAndAnswers.some((q) => q.answer === word);

    updateSelectionState({
      foundWords: isFound ? [...gameState.foundWords, { word, cells: selected }] : gameState.foundWords,
      selectedCells: [],
      currentWord: "",
      selectedWord: "",
      isCorrect: isFound,
    });

    dragState.current.selected = [];
    dragState.current.direction = null;
    dragState.current.word = "";
  };

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: (_, gestureState) => {
      const index = getClosestCell(gestureState);
      if (!index) return;
      const [r, c] = index;
      beginSelection(r, c);
    },

    onPanResponderMove: (_, gestureState) => {
      const index = getClosestCell(gestureState);
      if (!index) return;
      const [r, c] = index;

      const selected = dragState.current.selected;
      if (selected.length && selected[selected.length - 1][0] === r && selected[selected.length - 1][1] === c) {
        return; // ignore if still on the same cell
      }
      extendSelection(r, c);
    },

    onPanResponderRelease: () => {
      if (!dragState.current.selected.length) return;
      commitSelection();
    },
  });
}
