import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CustomButton } from "../theme/ButtonCustom";
import { Magnify } from "@/assets/icon/Magnify";
import Timer from "@/assets/icon/Timer";
import { Typography } from "@/theme/Font";
import { useTime } from "@/hooks/useTime";
import { GameControlsProps } from "@/types/type";
import { CEFR } from "@/components/CEFR";
import { Color } from "@/theme/Color";
import * as Clipboard from "expo-clipboard";
import CopyIcon from "@/assets/icon/CopyIcon";

export default function GameControls({
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
}: GameControlsProps) {
  const [copied, setCopied] = useState(false);
  const [currentHints, setCurrentHints] = useState<number>(
    typeof hintCount === "number" ? hintCount : 0
  );

  const { secondsLeft } = useTime({
    startTimeSeconds,
    paused,
    onTimeUp,
    resetSignal: resetKey,
  });

  useEffect(() => {
    if (typeof hintCount === "number") {
      setCurrentHints(hintCount);
    }
  }, [hintCount]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const hasHints = currentHints > 0;
  const parentThinksNoHints = typeof hintCount === "number" && hintCount === 0;

  const computedDisabled = hasHints
    ? Boolean(isHintDisabled && !parentThinksNoHints)
    : false;

  const onPressHint = () => {
    if (!hasHints) {
      onRequestBuyHints?.();
      return;
    }
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
        <Text style={styles.title}>{title}</Text>
        <View style={styles.row}>
          {gameCode ? (
            <Pressable
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

          <View style={styles.chip}>
            <CEFR level={cefr} />
          </View>
        </View>
      </View>

      {startTimeSeconds > 0 && (
        <View style={styles.box}>
          <View style={styles.timerRow}>
            <Timer />
            <Text style={styles.time}>{formatTime(secondsLeft)}</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonsRow}>
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
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", padding: 16 },
  title: { ...Typography.header25, textAlign: "center" },
  box: {
    backgroundColor: "rgba(249, 249, 249, 0.8)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
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
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  pill: {
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: Color.green,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  pillText: {
    ...Typography.header16,
    color: Color.white,
  },
  iconGap: {
    marginLeft: 6,
    color: Color.white,
  },
  codeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  copiedText: {
    ...Typography.header13,
    color: Color.green,
  },
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
  hintCaption: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    width: "100%",
    textAlign: "center",
  },
});
