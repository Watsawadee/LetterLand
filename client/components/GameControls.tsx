import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import FontSizeModal from "./FontSizeModal";
import { CustomButton } from "../theme/ButtonCustom";
import { Magnify } from "../assets/icon/Magnify";
import FontIcon from "@/assets/icon/FontIcon";
import Timer from "@/assets/icon/Timer";
import { Typography } from "@/theme/Font";
import { useTime } from "@/hooks/useTime";
import { GameControlsProps } from "@/types/type";
import HintShopModal from "../components/HintShopModal";

export default function GameControls({
  title,
  fontSettings,
  onShowHint,
  hintCount,
  isHintDisabled,
  startTimeSeconds,
  onTimeUp,
  paused = false,
  resetKey,
  refreshHints,
}: GameControlsProps) {
  const {
    fontModalVisible,
    tempFontSize,
    setTempFontSize,
    setFontModalVisible,
    setFontSize,
  } = fontSettings;

  const { secondsLeft } = useTime({
    startTimeSeconds,
    paused,
    onTimeUp,
    resetSignal: resetKey,
  });

  const [shopVisible, setShopVisible] = useState(false);
  const [currentHints, setCurrentHints] = useState<number>(
    typeof hintCount === "number" ? hintCount : 0
  );

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

  // Ignore stale "no hints" disable when we locally have hints (just after purchase)
  const parentThinksNoHints =
    typeof hintCount === "number" && hintCount === 0;

  const computedDisabled = hasHints
    ? Boolean(isHintDisabled && !parentThinksNoHints)
    : false;

  const onPressHint = () => {
    if (!hasHints) {
      setShopVisible(true);
      return;
    }
    if (computedDisabled) return;
    onShowHint();
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

        <View>
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

      <HintShopModal
        visible={shopVisible}
        onClose={() => setShopVisible(false)}
        onPurchased={(newHint) => {
          setCurrentHints(newHint);
          setShopVisible(false);
          refreshHints?.();
        }}
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
