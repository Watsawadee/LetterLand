import { PanResponder } from "react-native";
import { MutableRefObject, useRef } from "react";

export type GameState = {
  selectedCells: [number, number][];
  currentWord: string;
  selectedWord: string;
  isCorrect: boolean | null;
  foundWords: { word: string; cells: [number, number][] }[];
};

type Params = {
  GRID_SIZE: number;
  CELL_SIZE: number;
  gridRef: MutableRefObject<string[][]>;
  layoutRef: MutableRefObject<{ x: number; y: number }>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  questionsAndAnswers: { question: string; answer: string }[];
};

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
    const g = gridRef.current;
    if (g[row] && g[row][col]) return g[row][col];
    return "";
  };

  const getLetterIndex = (gestureState: any): [number, number] | null => {
    const touchX = gestureState.moveX - layoutRef.current.x;
    const touchY = gestureState.moveY - layoutRef.current.y;

    let minDistance = Infinity;
    let closestCell: [number, number] | null = null;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const centerX = col * CELL_SIZE + CELL_SIZE / 2;
        const centerY = row * CELL_SIZE + CELL_SIZE / 2;
        const dx = centerX - touchX;
        const dy = centerY - touchY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CELL_SIZE / 2 && distance < minDistance) {
          minDistance = distance;
          closestCell = [row, col];
        }
      }
    }

    return closestCell;
  };

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: (_, gestureState) => {
      const index = getLetterIndex(gestureState);
      if (!index) return;
      const [r, c] = index;
      const letter = getLetter(r, c);

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
      const index = getLetterIndex(gestureState);
      if (!index) return;
      const [r, c] = index;

      if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return;
      if (dragState.current.selected.some(([pr, pc]) => pr === r && pc === c)) return;

      const letter = getLetter(r, c);
      const selected = dragState.current.selected;

      if (selected.length === 1) {
        const [pr, pc] = selected[0];
        const dr = r - pr;
        const dc = c - pc;

        if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0)) {
          dragState.current.direction = [dr, dc];
        } else return;
      } else if (dragState.current.direction) {
        const [lastR, lastC] = selected[selected.length - 1];
        const [dr, dc] = dragState.current.direction;
        if (r - lastR !== dr || c - lastC !== dc) return;
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
      const word = dragState.current.word;
      const selected = dragState.current.selected;

      if (questionsAndAnswers.some((q) => q.answer === word)) {
        updateSelectionState({
          foundWords: [...gameState.foundWords, { word, cells: selected }],
          selectedCells: [],
          currentWord: "",
          selectedWord: "",
          isCorrect: true,
        });
      } else {
        updateSelectionState({
          selectedCells: [],
          currentWord: "",
          selectedWord: "",
          isCorrect: false,
        });
      }

      dragState.current.selected = [];
      dragState.current.direction = null;
      dragState.current.word = "";
    },
  });
};
