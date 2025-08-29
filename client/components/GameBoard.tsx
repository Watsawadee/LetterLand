import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { GameBoardProps } from "../types/type";

export default function GameBoard(props: GameBoardProps) {
  const {
    grid,
    CELL_SIZE,
    selectedCells,
    foundWords,
    hintCell,
    fontSize,
    panHandlers,
    layoutRef,
  } = props;
  const viewRef = useRef<View>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const measure = () => {
      if (viewRef.current) {
        viewRef.current.measureInWindow((x, y, width, height) => {
          layoutRef.current = { x, y };
        });
      }
    };

    setTimeout(measure, 0);
  }, []);

  useEffect(() => {
    if (hintCell) {
      pulseAnim.setValue(1);
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hintCell]);

  return (
    <View
      ref={viewRef}
      style={[styles.grid, { width: CELL_SIZE * grid.length }]}
      {...panHandlers}
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
              hintCell?.[0] === rowIndex &&
              hintCell?.[1] === colIndex &&
              !isCorrectCell &&
              !isSelected;

            const cellStyles = [
              styles.cell,
              { width: CELL_SIZE, height: CELL_SIZE },
              isCorrectCell && !isSelected && styles.correctCell,
              isSelected && styles.selectedCell,
            ];

            if (isHint) {
              return (
                <Animated.View
                  key={colIndex}
                  style={[
                    cellStyles,
                    styles.hintCell,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <View style={styles.charWrapper}>
                    <Text style={[styles.char, { fontSize }]}>{char}</Text>
                  </View>
                </Animated.View>
              );
            }

            return (
              <View key={colIndex} style={cellStyles}>
                <View style={styles.charWrapper}>
                  <Text style={[styles.char, { fontSize }]}>{char}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 4,
    padding: 6,
  },
  selectedCell: {
    backgroundColor: "#add8e6",
  },
  correctCell: {
    backgroundColor: "#90ee90",
  },
  hintCell: {
    backgroundColor: "#ffff99",
  },
  charWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  char: {
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
