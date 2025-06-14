export const generateGrid = (
  words: string[],
  gridSize: number,
): { grid: string[][]; positions: Record<string, [number, number][]> } => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let positions: Record<string, [number, number][]> = {};
  const directions = [
  [-1, 0],  // up
  [1, 0],   // down
  [0, -1],  // left
  [0, 1],   // right
  [-1, -1], // up-left
  [-1, 1],  // up-right
  [1, -1],  // down-left
  [1, 1],   // down-right
];

  const placeAllWords = (): string[][] | null => {
    const grid = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill("")
    );

    for (const word of words) {
      let placed = false;
      for (let attempts = 0; attempts < 100 && !placed; attempts++) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        let r = Math.floor(Math.random() * gridSize);
        let c = Math.floor(Math.random() * gridSize);
        let fits = true;
        const wordPos: [number, number][] = [];

        for (let i = 0; i < word.length; i++) {
          const nr = r + dir[0] * i;
          const nc = c + dir[1] * i;
          if (
            nr < 0 ||
            nc < 0 ||
            nr >= gridSize ||
            nc >= gridSize ||
            (grid[nr][nc] !== "" && grid[nr][nc] !== word[i])
          ) {
            fits = false;
            break;
          }
          wordPos.push([nr, nc]);
        }

        if (fits) {
          for (let i = 0; i < word.length; i++) {
            const [nr, nc] = wordPos[i];
            grid[nr][nc] = word[i];
          }
          positions[word] = wordPos;
          placed = true;
        }
      }
      if (!placed) return null;
    }
    return grid;
  };

  let newGrid: string[][] | null;
  while (!(newGrid = placeAllWords())) {}

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!newGrid[i][j]) {
        newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid: newGrid, positions };
};
