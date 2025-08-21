export const generateGrid = (
  words: string[],
  gridSize: number
): { grid: string[][]; positions: Record<string, [number, number][]> } => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let positions: Record<string, [number, number][]> = {};
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
    [-1, -1], // up-left
    [-1, 1], // up-right
    [1, -1], // down-left
    [1, 1], // down-right
  ];

  const cleanWords = words.map(w => w.replace(/\s+/g, ""));
  const placeAllWords = (): string[][] | null => {
    const grid = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill("")
    );

    for (const word of cleanWords) {
      if (word.length > gridSize) {
        console.error(`Word "${word}" is too long for grid size ${gridSize}`);
        continue;
      }
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
          // console.log(
          //   `✅ Placed word '${word}' at (${r},${c}) with direction [${dir}]`
          // );
        } else {
          // console.log(
          //   `❌ Failed attempt for word '${word}' at (${r},${c}) with direction [${dir}]`
          // );
        }
      }

      if (!placed) {
        // console.log(`🚫 Could not place word '${word}' after 100 attempts`);
        return null;
      }
    }

    // grid.forEach((row) => console.log(row.join(" ")));

    return grid;
  };

  let newGrid: string[][] | null;
  while (!(newGrid = placeAllWords())) {}

  // Fill empty cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!newGrid[i][j]) {
        newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  // newGrid.forEach((row) => console.log(row.join(" ")));

  return { grid: newGrid, positions };
};
