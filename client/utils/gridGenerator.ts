type Coord = [number, number];
type Direction = [number, number];
type PositionsMap = Record<string, Coord[]>;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIRECTIONS: Direction[] = [
  [-1, 0],  // up
  [1, 0],   // down
  [0, -1],  // left
  [0, 1],   // right
  [-1, -1], // up-left
  [-1, 1],  // up-right
  [1, -1],  // down-left
  [1, 1],   // down-right
];

const createEmptyGrid = (n: number): string[][] =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));

const inBounds = (r: number, c: number, n: number) => r >= 0 && c >= 0 && r < n && c < n;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const canPlace = (grid: string[][], word: string, r: number, c: number, dir: Direction): boolean => {
  const n = grid.length;
  for (let i = 0; i < word.length; i++) {
    const nr = r + dir[0] * i;
    const nc = c + dir[1] * i;
    if (!inBounds(nr, nc, n)) return false;
    const cell = grid[nr][nc];
    if (cell !== "" && cell !== word[i]) return false;
  }
  return true;
};

const placeWord = (grid: string[][], word: string, r: number, c: number, dir: Direction): Coord[] => {
  const coords: Coord[] = [];
  for (let i = 0; i < word.length; i++) {
    const nr = r + dir[0] * i;
    const nc = c + dir[1] * i;
    grid[nr][nc] = word[i];
    coords.push([nr, nc]);
  }
  return coords;
};

const fillRandomLetters = (grid: string[][], letters: string) => {
  const n = grid.length;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
};

export function generateGrid(words: string[], gridSize: number): { grid: string[][]; positions: PositionsMap } {
  // Normalize and pre-filter
  const cleanWords = words
    .map((w) => (w ?? "").toUpperCase().trim())
    .filter((w) => w.length > 0 && w.length <= gridSize);

  // Place long words first
  cleanWords.sort((a, b) => b.length - a.length);

  const MAX_LAYOUT_ATTEMPTS = 300;
  const MAX_TRIES_PER_WORD = 80;

  let finalGrid: string[][] | null = null;
  let finalPositions: PositionsMap = {};

  for (let layoutAttempt = 0; layoutAttempt < MAX_LAYOUT_ATTEMPTS; layoutAttempt++) {
    const grid = createEmptyGrid(gridSize);
    const positions: PositionsMap = {};
    let success = true;

    for (const word of cleanWords) {
      let placed = false;

      for (let attempt = 0; attempt < MAX_TRIES_PER_WORD && !placed; attempt++) {
        const dir = shuffle(DIRECTIONS)[Math.floor(Math.random() * DIRECTIONS.length)];
        const r = Math.floor(Math.random() * gridSize);
        const c = Math.floor(Math.random() * gridSize);

        if (!canPlace(grid, word, r, c, dir)) continue;
        positions[word] = placeWord(grid, word, r, c, dir);
        placed = true;
      }

      if (!placed) {
        success = false;
        break;
      }
    }

    if (!success) continue;

    fillRandomLetters(grid, LETTERS);
    finalGrid = grid;
    finalPositions = positions;
    break;
  }

  if (!finalGrid) {
    const grid = createEmptyGrid(gridSize);
    fillRandomLetters(grid, LETTERS);
    return { grid, positions: {} };
  }

  return { grid: finalGrid, positions: finalPositions };
}
