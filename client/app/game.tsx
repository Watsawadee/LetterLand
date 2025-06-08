import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import FontSizeModal from "../components/FontSizeModal";
import ConfirmModal from "../components/ConfirmModal";

const CELL_SIZE = 50;
const GRID_SIZE = 10;
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const questionsAndAnswers = [
  { question: "A man's best friend", answer: "DOG" },
  { question: "A small feline animal", answer: "CAT" },
  { question: "A food item made from dough", answer: "BREAD" },
  { question: "Essential for hydration", answer: "WATER" },
];

const WordSearchGame = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const gridRef = useRef<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<
    { word: string; cells: [number, number][] }[]
  >([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintCell, setHintCell] = useState<[number, number] | null>(null);

  const [selectedWord, setSelectedWord] = useState("");
  const layoutRef = useRef({ x: 0, y: 0 });
  const dragState = useRef({
    selected: [] as [number, number][],
    direction: null as [number, number] | null,
    word: "",
  });
  const answerPositionsRef = useRef<Record<string, [number, number][]> | null>(
    null
  );
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [tempFontSize, setTempFontSize] = useState(fontSize);
  const [confirmRestartVisible, setConfirmRestartVisible] = useState(false);

  useEffect(() => {
    const answers = questionsAndAnswers.map((item) => item.answer);
    const { grid, positions } = generateGrid(answers);
    setGrid(grid);
    answerPositionsRef.current = positions;
    setCurrentWord("");
    setSelectedCells([]);
    setFoundWords([]);
    setSelectedWord("");
  }, []);

  // Added this effect to mirror grid into ref
  useEffect(() => {
    gridRef.current = grid;
    // console.log("Grid is ready:", grid);
  }, [grid]);

  // Modified getLetter to use gridRef
  const getLetter = (row: number, col: number): string => {
    const g = gridRef.current;
    if (g[row] && g[row][col]) {
      // console.log(`Letter at (${row},${col}) →`, g[row][col]);
      return g[row][col];
    }
    return "";
  };

  const generateGrid = (
    words: string[]
  ): { grid: string[][]; positions: Record<string, [number, number][]> } => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let positions: Record<string, [number, number][]> = {};

    const placeAllWords = () => {
      const grid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill("")
      );

      for (const word of words) {
        let placed = false;
        for (let attempts = 0; attempts < 100 && !placed; attempts++) {
          const dir = directions[Math.floor(Math.random() * directions.length)];
          let r = Math.floor(Math.random() * GRID_SIZE);
          let c = Math.floor(Math.random() * GRID_SIZE);
          let fits = true;
          const wordPos: [number, number][] = [];

          for (let i = 0; i < word.length; i++) {
            const nr = r + dir[0] * i;
            const nc = c + dir[1] * i;
            if (
              nr < 0 ||
              nc < 0 ||
              nr >= GRID_SIZE ||
              nc >= GRID_SIZE ||
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

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!newGrid[i][j]) {
          newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    return { grid: newGrid, positions };
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

    if (
      closestCell &&
      !selectedCells.some(
        ([r, c]) => r === closestCell![0] && c === closestCell![1]
      )
    ) {
      return closestCell;
    }

    return null;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        const index = getLetterIndex(gestureState);
        if (!index) return;
        const [r, c] = index;
        const letter = getLetter(r, c);

        dragState.current = {
          selected: [[r, c]],
          direction: null,
          word: letter,
        };
        setSelectedCells([[r, c]]);
        setCurrentWord(letter);
        setSelectedWord(letter);
        setIsCorrect(null);
      },

      onPanResponderMove: (e, gestureState) => {
        const index = getLetterIndex(gestureState);
        if (!index) return;
        const [r, c] = index;

        const letter = getLetter(r, c);

        if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return;

        const alreadySelected = dragState.current.selected.some(
          ([pr, pc]) => pr === r && pc === c
        );
        if (alreadySelected) return;

        const selected = dragState.current.selected;
        const word = dragState.current.word;

        if (selected.length === 0) {
          dragState.current.selected.push([r, c]);
          dragState.current.word = word + letter;

          // console.log(`Dragged to position1: (${r}, ${c}), Letter: ${letter}`);
        } else if (selected.length === 1) {
          const [pr, pc] = selected[0];
          const dr = r - pr;
          const dc = c - pc;

          if (
            Math.abs(dr) <= 1 &&
            Math.abs(dc) <= 1 &&
            (dr !== 0 || dc !== 0)
          ) {
            dragState.current.direction = [dr, dc];
            dragState.current.selected.push([r, c]);
            dragState.current.word = word + letter;

            // console.log(
            //   `Dragged to position2: (${r}, ${c}), Letter: ${letter}`
            // );
          }
        } else {
          const [lastR, lastC] = selected[selected.length - 1];
          const [dr, dc] = dragState.current.direction!;
          if (r - lastR === dr && c - lastC === dc) {
            dragState.current.selected.push([r, c]);
            dragState.current.word = word + letter;

            // console.log(
            //   `Dragged to position3: (${r}, ${c}), Letter: ${letter}`
            // );
          }
        }

        setSelectedCells([...dragState.current.selected]);
        setIsCorrect(null);
        setCurrentWord(dragState.current.word);
        setSelectedWord(dragState.current.word);
      },

      onPanResponderRelease: () => {
        const word = dragState.current.word;
        const selected = dragState.current.selected;

        if (questionsAndAnswers.some((q) => q.answer === word)) {
          setFoundWords((prev) => [...prev, { word, cells: selected }]);
          setIsCorrect(true);
        } else {
          setIsCorrect(false);
        }

        setSelectedCells([]);
        setCurrentWord(word);
        setSelectedWord("");
        dragState.current = {
          selected: [],
          direction: null,
          word: "",
        };
      },
    })
  ).current;

  const showHint = () => {
    const remaining = questionsAndAnswers.find(
      (qa) => !foundWords.some((fw) => fw.word === qa.answer)
    );
    if (!remaining) return;

    const pos = answerPositionsRef.current?.[remaining.answer];
    if (pos && pos.length) {
      setHintCell(pos[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.question}>Find all the words!</Text>
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={() => {
            const answers = questionsAndAnswers.map((item) => item.answer);
            const { grid, positions } = generateGrid(answers);
            setGrid(grid);
            answerPositionsRef.current = positions;
            setCurrentWord("");
            setSelectedCells([]);
            setFoundWords([]);
            setHintCell(null);
            setConfirmRestartVisible(false);
          }}
        >
          <Text style={styles.newGameText}>Retry</Text>
        </TouchableOpacity>

        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={showHint} style={styles.hintButton}>
            <Text style={styles.hintText}>Hint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFontModalVisible(true)}
            style={[styles.fontSizeButton, { marginTop: 10 }]}
          >
            <Text style={styles.fontSizeButtonText}>A+</Text>
          </TouchableOpacity>
        </View>
        <ConfirmModal
          visible={confirmRestartVisible}
          title="Restart Game"
          message="Are you sure you want to start a new game? Your current progress will be lost."
          onConfirm={() => {
            const answers = questionsAndAnswers.map((item) => item.answer);
            const { grid, positions } = generateGrid(answers);
            setGrid(grid);
            answerPositionsRef.current = positions;
            setCurrentWord("");
            setSelectedCells([]);
            setFoundWords([]);
            setHintCell(null);
            setConfirmRestartVisible(false);
          }}
          onCancel={() => setConfirmRestartVisible(false)}
        />

        <FontSizeModal
          visible={fontModalVisible}
          tempFontSize={tempFontSize}
          setTempFontSize={setTempFontSize}
          onConfirm={() => {
            setFontSize(tempFontSize);
            setFontModalVisible(false);
          }}
          onClose={() => setFontModalVisible(false)}
        />
      </View>

      <View style={styles.questionsContainer}>
        {questionsAndAnswers.map((q, index) => {
          const found = foundWords.find((fw) => fw.word === q.answer);
          return (
            <Text key={index} style={styles.questionText}>
              {q.question}
              {found && (
                <Text style={{ color: "green" }}> ➔ {found.word} ✓</Text>
              )}
            </Text>
          );
        })}
      </View>

      <View
        style={[styles.grid, { width: CELL_SIZE * GRID_SIZE }]}
        {...panResponder.panHandlers}
        onLayout={(e) => (layoutRef.current = e.nativeEvent.layout)}
      >
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((char, colIndex) => {
              const isSelected = selectedCells.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );
              const isCorrectCell = foundWords.some((word) =>
                word.cells.some(([r, c]) => r === rowIndex && c === colIndex)
              );
              const isHint =
                hintCell &&
                hintCell[0] === rowIndex &&
                hintCell[1] === colIndex &&
                !isCorrectCell;

              return (
                <View
                  key={colIndex}
                  style={[
                    styles.cell,
                    { width: CELL_SIZE, height: CELL_SIZE },
                    isCorrectCell && !isSelected && styles.correctCell,
                    isSelected && styles.selectedCell,
                    !isSelected && isHint && styles.hintCell,
                  ]}
                >
                  <Text style={[styles.char, { fontSize }]}>{char}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {currentWord !== "" && (
        <Text
          style={[
            styles.currentWord,
            {
              color: isCorrect === null ? "#333" : isCorrect ? "green" : "red",
            },
          ]}
        >
          {currentWord}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  question: { fontSize: 18, marginBottom: 20 },
  questionsContainer: { marginBottom: 20 },
  questionText: { fontSize: 16, marginVertical: 5 },
  grid: { marginBottom: 20 },
  row: { flexDirection: "row" },
  cell: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 4,
  },
  selectedCell: { backgroundColor: "#add8e6" },
  correctCell: { backgroundColor: "#90ee90" },
  char: { fontSize: 18 },
  currentWord: { fontSize: 22, marginTop: 10 },
  selectedWordText: { fontSize: 16, color: "#555", marginTop: 5 },
  foundWordsContainer: { marginTop: 20 },
  foundWord: { fontSize: 16 },
  hintCell: {
    backgroundColor: "#ffff99",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  newGameButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#888",
  },

  newGameText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  rightButtons: {
    flexDirection: "column",
    alignItems: "flex-end",
  },

  hintButton: {
    backgroundColor: "#ffa",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#888",
  },

  hintText: { fontSize: 14, fontWeight: "bold" },

  fontSizeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10,
  },

  fontSizeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WordSearchGame;
