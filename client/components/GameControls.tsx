import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import FontSizeModal from "./FontSizeModal";
import { CustomButton } from "../theme/ButtonCustom";
import { Magnify } from "../assets/icon/Magnify";
import FontIcon from "@/assets/icon/FontIcon";
import Timer from "@/assets/icon/Timer";
import { Typography } from "@/theme/Font";

type FontSettings = {
  fontModalVisible: boolean;
  tempFontSize: number;
  fontSize: number;
  setTempFontSize: (n: number) => void;
  setFontModalVisible: (v: boolean) => void;
  setFontSize: (n: number) => void;
};

type GameControlsProps = {
  title: string;
  onShowHint: () => void;
  hintCount: number;
  isHintDisabled: boolean;
  fontSettings: FontSettings;
  startTimeSeconds: number;
  onTimeUp: () => void;
};

export default function GameControls({
  title,
  fontSettings,
  onShowHint,
  hintCount,
  isHintDisabled,
  startTimeSeconds,
  onTimeUp,
}: GameControlsProps) {
  const {
    fontModalVisible,
    tempFontSize,
    setTempFontSize,
    setFontModalVisible,
    setFontSize,
  } = fontSettings;

  const [secondsLeft, setSecondsLeft] = useState(startTimeSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer whenever startTimeSeconds changes
  useEffect(() => {
    setSecondsLeft(startTimeSeconds);
  }, [startTimeSeconds]);

  // Start countdown
  useEffect(() => {
    if (!startTimeSeconds || startTimeSeconds <= 0) return;
    setSecondsLeft(startTimeSeconds);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimeSeconds, onTimeUp]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
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
          onPress={() => setFontModalVisible(true)}
          type="fontSize"
          icon={<FontIcon />}
        />
        <CustomButton
          onPress={onShowHint}
          type="buyHint"
          icon={<Magnify />}
          disabled={isHintDisabled}
          number={hintCount}
        />
      </View>

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
  time: { marginTop: 4, ...Typography.header30 },
  buttonsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
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
