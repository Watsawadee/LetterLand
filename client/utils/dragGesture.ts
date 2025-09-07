import { useEffect, useRef } from "react";
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { GameState, LayoutMeta, DragGestureConfig } from "@/types/type";

function validateConfig(cfg: DragGestureConfig) {
  if (!cfg || typeof cfg.GRID_SIZE !== "number" || typeof cfg.CELL_SIZE !== "number") {
    throw new Error("useDragGesture: invalid config");
  }
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function getPointerXY(
  evt: GestureResponderEvent,
  gestureState: PanResponderGestureState
): { x: number; y: number } {
  const nx = (evt as any)?.nativeEvent?.pageX;
  const ny = (evt as any)?.nativeEvent?.pageY;
  if (typeof nx === "number" && typeof ny === "number") {
    return { x: nx, y: ny };
  }
  return { x: gestureState.moveX, y: gestureState.moveY };
}

function mapPageToCell(args: {
  moveX: number;
  moveY: number;
  layout: LayoutMeta | null | undefined;
  gridSize: number;
  fallbackCellSize: number;
}): [number, number] | null {
  const { moveX, moveY, layout, gridSize, fallbackCellSize } = args;
  if (!layout) return null;

  const originX = layout.x ?? 0;
  const originY = layout.y ?? 0;

  const margin = layout.margin ?? 0;
  const cellSize = layout.cellSize ?? fallbackCellSize;
  const pitch = layout.pitch ?? cellSize + margin * 2;
  if (pitch <= 0) return null;

  const max = gridSize * pitch;
  const localX = clamp(moveX - originX, 0, max - 0.0001);
  const localY = clamp(moveY - originY, 0, max - 0.0001);

  const col = Math.floor(localX / pitch);
  const row = Math.floor(localY / pitch);
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;

  const offsetX = localX - col * pitch;
  const offsetY = localY - row * pitch;
  const insideX = offsetX >= margin && offsetX <= margin + cellSize;
  const insideY = offsetY >= margin && offsetY <= margin + cellSize;
  if (!(insideX && insideY)) return null;

  return [row, col];
}

const sign = (n: number) => (n === 0 ? 0 : n > 0 ? 1 : -1);
const normalizeStep = (dr: number, dc: number): [number, number] => [sign(dr), sign(dc)];
const equalCell = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];

function isAlignedTo8Dirs(from: [number, number], to: [number, number]) {
  const dr = to[0] - from[0];
  const dc = to[1] - from[1];
  return dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
}

function alignedWithDir(from: [number, number], to: [number, number], dir: [number, number]) {
  const dr = to[0] - from[0];
  const dc = to[1] - from[1];

  if (dir[0] !== 0 && sign(dr) !== sign(dir[0])) return false;
  if (dir[1] !== 0 && sign(dc) !== sign(dir[1])) return false;

  if (dir[0] === 0 && dr !== 0) return false;
  if (dir[1] === 0 && dc !== 0) return false;
  if (Math.abs(dir[0]) === 1 && Math.abs(dir[1]) === 1 && Math.abs(dr) !== Math.abs(dc)) return false; // diagonal

  return true;
}

export function useDragGesture(config: DragGestureConfig) {
  validateConfig(config);
  const { GRID_SIZE, CELL_SIZE, gridRef, layoutRef, gameState, setGameState, questionsAndAnswers } = config;

  const gameStateRef = useRef<GameState>(gameState);
  const qaRef = useRef(questionsAndAnswers);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { qaRef.current = questionsAndAnswers; }, [questionsAndAnswers]);

  const dragState = useRef<{
    selected: [number, number][];
    direction: [number, number] | null;
    word: string;
  }>({ selected: [], direction: null, word: "" });

  const getLetter = (r: number, c: number) => gridRef.current?.[r]?.[c] ?? "";

  const updateSelectionState = (patch: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...patch }));
  };

  const addCellsBatch = (cells: [number, number][]) => {
    if (!cells.length) return;

    let nextWord = dragState.current.word;
    const nextSelected = [...dragState.current.selected];

    for (const [r, c] of cells) {
      const ch = getLetter(r, c);
      if (!ch) continue;
      if (nextSelected.length && equalCell(nextSelected[nextSelected.length - 1], [r, c])) continue;
      nextSelected.push([r, c]);
      nextWord += ch;
    }

    dragState.current.selected = nextSelected;
    dragState.current.word = nextWord;

    updateSelectionState({
      selectedCells: [...nextSelected],
      currentWord: nextWord,
      selectedWord: nextWord,
      isCorrect: null,
    });
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
    if (!selected.length) return;

    const last = selected[selected.length - 1];
    if (equalCell(last, [r, c])) return;

    if (selected.length === 1 && !dragState.current.direction) {
      const start = selected[0];
      if (!isAlignedTo8Dirs(start, [r, c])) return;

      const [dr, dc] = normalizeStep(r - start[0], c - start[1]);
      dragState.current.direction = [dr, dc];

      const path: [number, number][] = [];
      let curR = start[0];
      let curC = start[1];
      while (curR !== r || curC !== c) {
        curR += dr;
        curC += dc;
        if (curR < 0 || curR >= GRID_SIZE || curC < 0 || curC >= GRID_SIZE) break;
        path.push([curR, curC]);
      }
      addCellsBatch(path);
      return;
    }

    const dir = dragState.current.direction!;
    if (!alignedWithDir(last, [r, c], dir)) return;

    const path: [number, number][] = [];
    let curR = last[0];
    let curC = last[1];
    while (curR !== r || curC !== c) {
      curR += dir[0];
      curC += dir[1];
      if (curR < 0 || curR >= GRID_SIZE || curC < 0 || curC >= GRID_SIZE) break;
      path.push([curR, curC]);
    }
    addCellsBatch(path);
  };

  const commitSelection = () => {
    const { selected, word } = dragState.current;
    if (!selected.length) return;

    const qa = qaRef.current;
    const gs = gameStateRef.current;

    const isFound = qa.some((q) => q.answer === word);

    updateSelectionState({
      foundWords: isFound ? [...gs.foundWords, { word, cells: selected }] : gs.foundWords,
      selectedCells: [],
      currentWord: "",
      selectedWord: "",
      isCorrect: isFound,
    });

    dragState.current.selected = [];
    dragState.current.direction = null;
    dragState.current.word = "";
  };

  const responderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt, gestureState) => {
        const { x, y } = getPointerXY(evt, gestureState);
        const index = mapPageToCell({
          moveX: x,
          moveY: y,
          layout: layoutRef.current,
          gridSize: GRID_SIZE,
          fallbackCellSize: CELL_SIZE,
        });
        if (!index) return;
        const [r, c] = index;
        beginSelection(r, c);
      },

      onPanResponderMove: (evt, gestureState) => {
        const { x, y } = getPointerXY(evt, gestureState);
        const index = mapPageToCell({
          moveX: x,
          moveY: y,
          layout: layoutRef.current,
          gridSize: GRID_SIZE,
          fallbackCellSize: CELL_SIZE,
        });
        if (!index) return;

        const [r, c] = index;
        extendSelection(r, c);
      },

      onPanResponderRelease: () => {
        commitSelection();
      },

      onPanResponderTerminate: () => {
        commitSelection();
      },
    })
  );

  return responderRef.current;
}
