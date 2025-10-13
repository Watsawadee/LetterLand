import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CustomButton } from "../theme/ButtonCustom";
import { Magnify } from "@/assets/icon/Magnify";
import Timer from "@/assets/icon/Timer";
import { Typography } from "@/theme/Font";
import { useTime } from "@/hooks/useTime";
import { GameControlsProps } from "@/types/type";
import { CEFRPill } from "@/components/CEFRpill";
import { Color } from "@/theme/Color";
import * as Clipboard from "expo-clipboard";
import CopyIcon from "@/assets/icon/CopyIcon";

export type GameControlsHandle = {
  measureGameTitle: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
  measureGameCode: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
  measureTimer: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
  measureHintButton: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
  measureCefr: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
};

function measure(
  ref: React.RefObject<View | null>
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  return new Promise((resolve) => {
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

const GameControls = forwardRef<GameControlsHandle, GameControlsProps>(
  function GameControls(
    {
      title,
      onShowHint,
      hintCount,
      isHintDisabled,
      startTimeSeconds,
      onTimeUp,
      paused = false,
      resetKey,
      onRequestBuyHints,
      gameCode,
      cefr,
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const [currentHints, setCurrentHints] = useState<number>(
      typeof hintCount === "number" ? hintCount : 0
    );

    const gameTitleWrapRef = useRef<View>(null);
    const codePillWrapRef = useRef<View>(null);
    const timerWrapRef = useRef<View>(null);
    const hintBtnWrapRef = useRef<View>(null);
    const cefrChipRef = useRef<View>(null);

    useImperativeHandle(ref, () => ({
      measureGameTitle: () => measure(gameTitleWrapRef),
      measureGameCode: () => measure(codePillWrapRef),
      measureTimer: () => measure(timerWrapRef),
      measureHintButton: () => measure(hintBtnWrapRef),
      measureCefr: () => measure(cefrChipRef),
    }));

    const { secondsLeft } = useTime({
      startTimeSeconds,
      paused,
      onTimeUp,
      resetSignal: resetKey,
    });

    useEffect(() => {
      if (typeof hintCount === "number") setCurrentHints(hintCount);
    }, [hintCount]);

    const formatTime = (sec: number) => {
      const minutes = Math.floor(sec / 60);
      const seconds = sec % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };

    const hasHints = currentHints > 0;
    const parentThinksNoHints =
      typeof hintCount === "number" && hintCount === 0;
    const computedDisabled = hasHints
      ? Boolean(isHintDisabled && !parentThinksNoHints)
      : false;

    const onPressHint = () => {
      if (!hasHints) return onRequestBuyHints?.();
      if (computedDisabled) return;
      onShowHint();
    };

    const copyCode = async () => {
      if (!gameCode) return;
      await Clipboard.setStringAsync(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    };

    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <View ref={gameTitleWrapRef}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.row}>
            {gameCode ? (
              <Pressable
                ref={codePillWrapRef}
                onPress={copyCode}
                style={({ pressed }) => [
                  styles.pill,
                  styles.chip,
                  pressed && { opacity: 0.85 },
                ]}
                hitSlop={8}
              >
                <Text style={styles.pillText} numberOfLines={1}>
                  {gameCode}
                </Text>
                {copied ? (
                  <Text style={[styles.iconGap]}>✓</Text>
                ) : (
                  <View style={styles.iconGap}>
                    <CopyIcon />
                  </View>
                )}
              </Pressable>
            ) : null}

            <View ref={cefrChipRef} style={styles.chip}>
              <CEFRPill level={cefr} />
            </View>
          </View>
        </View>

        {startTimeSeconds > 0 && (
          <View style={styles.box}>
            <View ref={timerWrapRef} style={styles.timerRow}>
              <Timer />
              <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonsRow}>
          <View ref={hintBtnWrapRef}>
            <CustomButton
              onPress={onPressHint}
              type={hasHints ? "buyHint" : "useHint"}
              icon={
                <View style={{ opacity: computedDisabled ? 0.5 : 1 }}>
                  <Magnify />
                </View>
              }
              disabled={computedDisabled}
              number={Math.max(0, currentHints)}
            />
          </View>
        </View>
      </View>
    );
  }
);

export default GameControls;

const styles = StyleSheet.create({
  container: { width: "100%", padding: 16 },
  title: { ...Typography.header25, textAlign: "center" },
  box: {
    backgroundColor: "rgba(249, 249, 249, 0.8)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: Color.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  chip: {
    minHeight: 32,
    marginHorizontal: 4,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    backgroundColor: Color.green,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  pillText: { ...Typography.header16, color: Color.white },
  iconGap: { marginLeft: 6, color: Color.white },
  time: { marginTop: 4, ...Typography.header30 },
  buttonsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  timerRow: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 16,
  },
});
