import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { GameBoardProps } from "../types/type";
import { Typography } from "@/theme/Font";

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

  const PALETTE = [
    "#A0E7E5", // teal
    "#B4F8C8", // mint
    "#FBE7C6", // sand
    "#FFAEBC", // pink
    "#C8B6FF", // lavender
    "#FFD6A5", // peach
    "#BDE0FE", // sky
    "#D3F8E2", // pale green
    "#FFCFD2", // rose
    "#F1EAFF", // lilac
  ];

  const colorFromWord = (word: string) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
  };

  const getCoveringWord = (r: number, c: number) => {
    for (let i = foundWords.length - 1; i >= 0; i--) {
      const w = foundWords[i];
      if (w.cells.some(([rr, cc]) => rr === r && cc === c)) return w;
    }
    return undefined;
  };

  useEffect(() => {
    const measure = () => {
      if (viewRef.current) {
        viewRef.current.measureInWindow((x, y) => {
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

            const coveringWord = getCoveringWord(rowIndex, colIndex);
            const isCorrectCell = !!coveringWord;
            const wordColor = coveringWord
              ? colorFromWord(coveringWord.word)
              : undefined;

            const isHint =
              hintCell?.[0] === rowIndex && hintCell?.[1] === colIndex;

            const isHintVisible = isHint && !isSelected && !isCorrectCell;

            const cellStyles = [
              styles.cell,
              { width: CELL_SIZE, height: CELL_SIZE },
              isCorrectCell && !isSelected && wordColor
                ? { backgroundColor: wordColor }
                : null,
              isSelected && styles.selectedCell,
            ];

            return (
              <View key={colIndex} style={cellStyles}>
                {isHintVisible && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      styles.hintCell,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                )}

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
  grid: { marginBottom: 20 },
  row: { flexDirection: "row" },
  cell: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 4,
    padding: 6,
    position: "relative",
    overflow: "hidden",
  },
  selectedCell: { backgroundColor: "#add8e6" },
  hintCell: {
    backgroundColor: "#ffff99",
  },
  charWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  char: {
    ...Typography.popupbody25,
    textAlignVertical: "center",
    zIndex: 1,
  },
});
