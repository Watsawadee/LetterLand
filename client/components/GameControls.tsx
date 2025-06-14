import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import FontSizeModal from "./FontSizeModal";
import ConfirmModal from "./ConfirmModal";

interface GameHeaderProps {
  title: string;
  onRetry: () => void;
  onShowHint: () => void;
  onFontSizePress: () => void;
  onBackHome: () => void;
}

function GameHeader({
  title,
  onRetry,
  onShowHint,
  onFontSizePress,
  onBackHome,
}: GameHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBackHome} style={styles.button}>
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightButtons}>
        <TouchableOpacity onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowHint} style={styles.button}>
          <Text style={styles.buttonText}>Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onFontSizePress} style={styles.button}>
          <Text style={styles.buttonText}>Font Size</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface GameControlsProps {
  title: string;
  confirmRestartVisible: boolean;
  fontModalVisible: boolean;
  tempFontSize: number;
  setTempFontSize: (size: number) => void;
  setFontSize: (size: number) => void;
  setFontModalVisible: (visible: boolean) => void;
  setConfirmRestartVisible: (visible: boolean) => void;
  onRetryConfirm: () => void;
  onShowHint: () => void;
  onFontSizePress: () => void;
  onBackHome: () => void;
}

export default function GameControls({
  title,
  confirmRestartVisible,
  fontModalVisible,
  tempFontSize,
  setTempFontSize,
  setFontSize,
  setFontModalVisible,
  setConfirmRestartVisible,
  onRetryConfirm,
  onShowHint,
  onFontSizePress,
  onBackHome,
}: GameControlsProps) {
  return (
    <View style={styles.container}>
      <GameHeader
        title={title}
        onRetry={() => setConfirmRestartVisible(true)}
        onShowHint={onShowHint}
        onFontSizePress={onFontSizePress}
        onBackHome={onBackHome}
      />

      <ConfirmModal
        visible={confirmRestartVisible}
        message="If you exit now, your progress in this grid will be lost. Are you sure?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={onRetryConfirm}
        onCancel={() => setConfirmRestartVisible(false)}
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
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonText: {
    color: "blue",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
});
