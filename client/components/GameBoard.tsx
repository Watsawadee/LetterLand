import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import { GameBoardProps } from "../types/type";
import { Typography } from "@/theme/Font";

export default function GameBoard(props: GameBoardProps) {
  const {
    grid,
    CELL_SIZE,
    selectedCells,
    foundWords,
    hintCell,
    hintTargetWord,
    fontSize,
    panHandlers,
    layoutRef,
  } = props;

  const viewRef = useRef<View>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const CELL_MARGIN = 2;
  const CELL_PITCH = CELL_SIZE + CELL_MARGIN * 2;
  const GRID_WIDTH = grid.length * CELL_PITCH;

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

  const updateLayoutRef = useCallback(() => {
    if (!viewRef.current) return;
    viewRef.current.measureInWindow((x, y, _w, _h) => {
      layoutRef.current = {
        x: x + CELL_MARGIN,
        y: y + CELL_MARGIN,
        pitch: CELL_PITCH,
        cellSize: CELL_SIZE,
        margin: CELL_MARGIN,
      };
    });
  }, [layoutRef, CELL_MARGIN, CELL_PITCH, CELL_SIZE]);

  useEffect(() => {
    const id = requestAnimationFrame(updateLayoutRef);
    return () => cancelAnimationFrame(id);
  }, [updateLayoutRef, grid.length, CELL_SIZE]);

  const onLayout = useCallback(
    (_: LayoutChangeEvent) => {
      requestAnimationFrame(updateLayoutRef);
    },
    [updateLayoutRef]
  );

  const normalize = (s?: string | null) => (s ?? "").trim().toLowerCase();

  const isHintWordFoundByName =
    !!hintTargetWord &&
    foundWords.some((w) => normalize(w.word) === normalize(hintTargetWord));

  const isHintWordFoundByFirstCell =
    !!hintCell &&
    foundWords.some(
      (w) =>
        w.cells?.[0]?.[0] === hintCell[0] && w.cells?.[0]?.[1] === hintCell[1]
    );

  const isHintedWordFound = isHintWordFoundByName || isHintWordFoundByFirstCell;

  useEffect(() => {
    if (!hintCell || isHintedWordFound) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hintCell, isHintedWordFound, pulseAnim]);

  return (
    <View
      ref={viewRef}
      onLayout={onLayout}
      style={[styles.grid, { width: GRID_WIDTH }]}
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

            const isHintVisible = isHint && !isSelected && !isHintedWordFound;

            const cellStyles = [
              styles.cell,
              {
                width: CELL_SIZE,
                height: CELL_SIZE,
                margin: CELL_MARGIN,
              },
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
    borderRadius: 4,
    padding: 6,
    position: "relative",
    overflow: "hidden",
  },
  selectedCell: { backgroundColor: "#add8e6" },
  hintCell: { backgroundColor: "#ffff99" },
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
