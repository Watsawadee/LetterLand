import { useRef } from "react";
import { PanResponder, PanResponderGestureState } from "react-native";
import { GameState, Params } from "../types/type";

export const useDragGesture = ({
  GRID_SIZE,
  CELL_SIZE,
  gridRef,
  layoutRef,
  gameState,
  setGameState,
  questionsAndAnswers,
}: Params) => {
  const dragState = useRef<{
    selected: [number, number][];
    direction: [number, number] | null;
    word: string;
  }>({
    selected: [],
    direction: null,
    word: "",
  });

  const updateSelectionState = (updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  };

  const getLetter = (row: number, col: number): string => {
    const grid = gridRef.current;
    if (grid[row] && grid[row][col]) return grid[row][col];
    return "";
  };

  const getClosestCell = (
    gestureState: PanResponderGestureState
  ): [number, number] | null => {
    if (!layoutRef.current) return null;

    const maxPos = GRID_SIZE * CELL_SIZE;
    const touchX = Math.min(
      Math.max(gestureState.moveX - layoutRef.current.x, 0),
      maxPos - 0.1
    );
    const touchY = Math.min(
      Math.max(gestureState.moveY - layoutRef.current.y, 0),
      maxPos - 0.1
    );

    const col = Math.floor(touchX / CELL_SIZE);
    const row = Math.floor(touchY / CELL_SIZE);

    const centerX = col * CELL_SIZE + CELL_SIZE / 2;
    const centerY = row * CELL_SIZE + CELL_SIZE / 2;
    const dx = centerX - touchX;
    const dy = centerY - touchY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (
      distance < CELL_SIZE / 2 &&
      row >= 0 &&
      row < GRID_SIZE &&
      col >= 0 &&
      col < GRID_SIZE
    ) {
      return [row, col];
    }
    return null;
  };

  const isAdjacent = (
    [r1, c1]: [number, number],
    [r2, c2]: [number, number]
  ) => {
    const dr = Math.abs(r2 - r1);
    const dc = Math.abs(c2 - c1);
    return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0);
  };

  const isNextCellValid = (
    lastCell: [number, number],
    nextCell: [number, number],
    direction: [number, number]
  ) => {
    const [lastR, lastC] = lastCell;
    const [nextR, nextC] = nextCell;
    const [dr, dc] = direction;
    return nextR === lastR + dr && nextC === lastC + dc;
  };

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: (_, gestureState) => {
      const index = getClosestCell(gestureState);
      if (!index) return;

      const [r, c] = index;
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
    },

    onPanResponderMove: (_, gestureState) => {
      const index = getClosestCell(gestureState);
      if (!index) return;

      const [r, c] = index;

      if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return;
      if (dragState.current.selected.some(([pr, pc]) => pr === r && pc === c))
        return;

      const letter = getLetter(r, c);
      if (!letter) return;

      const selected = dragState.current.selected;

      if (selected.length === 1) {
        const [pr, pc] = selected[0];
        if (!isAdjacent([pr, pc], [r, c])) return;

        dragState.current.direction = [r - pr, c - pc];
      } else if (dragState.current.direction) {
        const [lastR, lastC] = selected[selected.length - 1];
        if (
          !isNextCellValid([lastR, lastC], [r, c], dragState.current.direction)
        )
          return;
      }

      dragState.current.selected.push([r, c]);
      dragState.current.word += letter;

      updateSelectionState({
        selectedCells: [...dragState.current.selected],
        currentWord: dragState.current.word,
        selectedWord: dragState.current.word,
        isCorrect: null,
      });
    },

    onPanResponderRelease: () => {
      const { word, selected } = dragState.current;

      const isFound = questionsAndAnswers.some((q) => q.answer === word);

      updateSelectionState({
        foundWords: isFound
          ? [...gameState.foundWords, { word, cells: selected }]
          : gameState.foundWords,
        selectedCells: [],
        currentWord: "",
        selectedWord: "",
        isCorrect: isFound,
      });

      dragState.current.selected = [];
      dragState.current.direction = null;
      dragState.current.word = "";
    },
  });
};
