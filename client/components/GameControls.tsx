import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontSizeModal from "./FontSizeModal";
import ConfirmModal from "./ConfirmModal";
import { GameControlsProps } from "../types/type";

export default function GameControls({
  title,
  fontSettings,
  confirmRestart,
  onShowHint,
  onBackHome,
  onRetryConfirm,
  hintCount,
  isHintDisabled,
}: GameControlsProps) {
  const {
    fontModalVisible,
    tempFontSize,
    setTempFontSize,
    setFontModalVisible,
    setFontSize,
  } = fontSettings;

  const currentTime = new Date().toLocaleTimeString();

  return (
    <View style={styles.container}>
      <View style={styles.topLeft}>
        <TouchableOpacity onPress={onBackHome} style={styles.button}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerLeft}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>{currentTime}</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={() => setFontModalVisible(true)}
            style={[styles.button]}
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
  container: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: "center",
  },
  topLeft: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  centerLeft: {
    marginTop: 60,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    width: "100%",
  },
  time: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: "blue",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  disabledButtonText: {
    color: "#888",
  },
});
