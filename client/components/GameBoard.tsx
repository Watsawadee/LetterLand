import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import { Color } from "@/theme/Color";

export type GameBoardHandle = {
  measureGrid: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
};

function measure(ref: React.RefObject<View | null>) {
  return new Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>((resolve) => {
    const node = ref.current as View | null;
    if (!node) return resolve(null);
    (node as any).measureInWindow?.(
      (x: number, y: number, w: number, h: number) => {
        resolve({ x, y, width: w, height: h });
      }
    );
    setTimeout(() => resolve(null), 120);
  });
}

const GameBoard = forwardRef<GameBoardHandle, GameBoardProps>(
  function GameBoard(props, ref) {
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

    useImperativeHandle(ref, () => ({
      measureGrid: () => measure(viewRef),
    }));

    const CELL_MARGIN = 2;
    const CELL_PITCH = CELL_SIZE + CELL_MARGIN * 2;
    const GRID_WIDTH = grid.length * CELL_PITCH;

    const BASE_PALETTE = [
      "#A0E7E5",
      "#B4F8C8",
      "#FBE7C6",
      "#FFAEBC",
      "#C8B6FF",
      "#FFD6A5",
      "#BDE0FE",
      "#D3F8E2",
      "#FFCFD2",
      "#F1EAFF",
      "#E6FFB3",
      "#B3FFF2",
      "#FFB3E6",
      "#B3C6FF",
      "#FFC6B3",
      "#D1FFD1",
    ];

    const normalizeWordKey = (s: string) => (s ?? "").trim().toLowerCase();

    // persistent map so colors don’t reshuffle on re-renders
    const wordColorMapRef = useRef<Map<string, string>>(new Map());

    // Golden-angle color generator for overflow beyond BASE_PALETTE
    const goldenAngle = 137.508;
    const genColorByIndex = (i: number) => {
      const hue = (i * goldenAngle) % 360;
      // light pastel-ish fill
      return `hsl(${hue} 70% 80%)`;
    };

    const getColorForWord = (word: string) => {
      const key = normalizeWordKey(word);
      const map = wordColorMapRef.current;
      if (map.has(key)) return map.get(key)!;

      // pick next unused from base palette first
      const used = new Set(map.values());
      const nextFixed = BASE_PALETTE.find((c) => !used.has(c));
      let color: string;
      if (nextFixed) {
        color = nextFixed;
      } else {
        // overflow: generate a new unique-ish color
        const idx = map.size - BASE_PALETTE.length;
        color = genColorByIndex(idx);
      }
      map.set(key, color);
      return color;
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
      (viewRef.current as any).measureInWindow(
        (x: number, y: number, _w: number, _h: number) => {
          layoutRef.current = {
            x: x + CELL_MARGIN,
            y: y + CELL_MARGIN,
            pitch: CELL_PITCH,
            cellSize: CELL_SIZE,
            margin: CELL_MARGIN,
          };
        }
      );
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
    const isHintedWordFound =
      isHintWordFoundByName || isHintWordFoundByFirstCell;

    useEffect(() => {
      if (!hintCell || isHintedWordFound) {
        (pulseAnim as any).stopAnimation?.();
        (pulseAnim as any).setValue?.(1);
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

    useEffect(() => {
      foundWords?.forEach((w) => {
        getColorForWord(w.word);
      });
    }, [foundWords]);

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
                ? getColorForWord(coveringWord.word)
                : undefined;
              const isHint =
                hintCell?.[0] === rowIndex && hintCell?.[1] === colIndex;
              const isHintVisible = isHint && !isSelected && !isHintedWordFound;

              const cellStyles = [
                styles.cell,
                { width: CELL_SIZE, height: CELL_SIZE, margin: CELL_MARGIN },
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
);

export default GameBoard;

const styles = StyleSheet.create({
  grid: {},
  row: { flexDirection: "row" },
  cell: {
    backgroundColor: Color.white,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  selectedCell: { backgroundColor: "#add8e6" },
  hintCell: { backgroundColor: "#ffff99" },
  charWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  char: { ...Typography.popupbody25, textAlignVertical: "center", zIndex: 1 },
});
