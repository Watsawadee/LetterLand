import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ConfirmModal from "./ConfirmModal";
import FontSizeModal from "./FontSizeModal";

type FontSettings = {
  fontModalVisible: boolean;
  tempFontSize: number;
  fontSize: number;
  setTempFontSize: (n: number) => void;
  setFontModalVisible: (v: boolean) => void;
  setFontSize: (n: number) => void;
};

type ConfirmRestart = {
  visible: boolean;
  setVisible: (v: boolean) => void;
};

type GameControlsProps = {
  title: string;
  onShowHint: () => void;
  onBackHome: () => void;
  onRetryConfirm: () => void;
  hintCount: number;
  isHintDisabled: boolean;
  fontSettings: FontSettings;
  confirmRestart: ConfirmRestart;
  startTimeSeconds: number;
};

export default function GameControls(props: GameControlsProps) {
  const {
    title,
    fontSettings,
    confirmRestart,
    onShowHint,
    onBackHome,
    onRetryConfirm,
    hintCount,
    isHintDisabled,
    startTimeSeconds,
  } = props;

  const {
    fontModalVisible,
    tempFontSize,
    setTempFontSize,
    setFontModalVisible,
    setFontSize,
  } = fontSettings;

  const [secondsLeft, setSecondsLeft] = useState(startTimeSeconds);

  useEffect(() => {
    setSecondsLeft(startTimeSeconds);
  }, [startTimeSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer); // stop timer
          alert("Time's up!"); // alert when time reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLeft}>
        <TouchableOpacity onPress={onBackHome} style={styles.button}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerLeft}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>{formatTime(secondsLeft)}</Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={() => setFontModalVisible(true)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Font Size</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShowHint}
            disabled={isHintDisabled}
            style={[styles.button, isHintDisabled && styles.disabledButton]}
          >
            <Text
              style={[
                styles.buttonText,
                isHintDisabled && styles.disabledButtonText,
              ]}
            >
              Hint
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 16 }}>Hints left: {hintCount}</Text>
      </View>

      <ConfirmModal
        visible={confirmRestart.visible}
        message="If you exit now, your progress in this grid will be lost. Are you sure?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={onRetryConfirm}
        onCancel={() => confirmRestart.setVisible(false)}
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
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  topLeft: { alignItems: "flex-start" },
  centerLeft: { marginTop: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  time: { marginTop: 6, fontSize: 14, opacity: 0.6 },
  buttonsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: { backgroundColor: "#aaa" },
  buttonText: { color: "white" },
  disabledButtonText: { color: "#eee" },
});
