import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { QuestionAnswer } from "../data/gameData";

type GameBoardProps = {
  grid: string[][];
  CELL_SIZE: number;
  selectedCells: [number, number][];
  foundWords: { word: string; cells: [number, number][] }[];
  hintCell: [number, number] | null;
  fontSize: number;
  questionsAndAnswers: QuestionAnswer[];
  renderQuestionItem: (q: QuestionAnswer, found: boolean) => React.ReactNode;
  panHandlers: any;
  layoutRef: React.MutableRefObject<{ x: number; y: number }>;
};

export default function GameBoard({
  grid,
  CELL_SIZE,
  selectedCells,
  foundWords,
  hintCell,
  fontSize,
  questionsAndAnswers,
  renderQuestionItem,
  panHandlers,
  layoutRef,
}: GameBoardProps) {
  return (
    <>
      <View style={styles.questionsContainer}>
        {questionsAndAnswers.map((q) => {
          const found = foundWords.some((fw) => fw.word === q.answer);
          return (
            <React.Fragment key={q.answer}>
              {renderQuestionItem(q, found)}
            </React.Fragment>
          );
        })}
      </View>

      <View
        style={[styles.grid, { width: CELL_SIZE * grid.length }]}
        {...panHandlers}
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          layoutRef.current = { x, y };
        }}
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
    </>
  );
}

const styles = StyleSheet.create({
  questionsContainer: { marginBottom: 20 },
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
  hintCell: { backgroundColor: "#ffff99" },
});
