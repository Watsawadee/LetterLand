import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { FontSizeModalProps } from "../types/type";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import FontHeaderBG from "../assets/backgroundTheme/FontHeaderBG";

const MIN = 30;
const MAX = 40;
const STEP = 1;

export default function FontSizeModal({
  visible,
  tempFontSize,
  setTempFontSize,
  onConfirm,
  onClose,
}: FontSizeModalProps) {
  const bump = (d: number) =>
    setTempFontSize(Math.max(MIN, Math.min(MAX, tempFontSize + d)));

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <FontHeaderBG style={styles.header}>
            <Text style={styles.headerTitle}>Font size</Text>
          </FontHeaderBG>

          <View style={styles.body}>
            <View style={styles.sliderRow}>
              <TouchableOpacity
                onPress={() => bump(-STEP)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>−</Text>
              </TouchableOpacity>

              <View style={styles.sliderWrap}>
                <Slider
                  style={styles.slider}
                  minimumValue={MIN}
                  maximumValue={MAX}
                  step={STEP}
                  value={tempFontSize}
                  onValueChange={setTempFontSize}
                  minimumTrackTintColor={Color.lightgreen}
                  maximumTrackTintColor={"#DADDE1"}
                  thumbTintColor={"#000"}
                />
                <View pointerEvents="none" style={styles.dotsRow}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => bump(STEP)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sizeLabel}>{tempFontSize}px</Text>
            <TouchableOpacity onPress={onConfirm} style={styles.primaryBtn}>
              <Text style={[Typography.Button, styles.primaryText]}>
                Adjust
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const DOT_SIZE = 6;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: 500,
    maxWidth: "100%",
    borderRadius: 18,
    backgroundColor: "#F4FAFD",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  header: {
    width: "100%",
    height: 100,
  },
  headerTitle: {
    ...Typography.header20,
    fontWeight: "800",
    color: Color.white,
  },

  body: { paddingHorizontal: 20, paddingVertical: 18 },
  sliderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconBtn: { width: 36, alignItems: "center" },
  iconText: { ...Typography.header20, color: "#000", fontWeight: "900" },

  sliderWrap: {
    flex: 1,
    position: "relative",
    height: 40,
    justifyContent: "center",
  },
  slider: { width: "100%", height: 40 },

  dotsRow: {
    position: "absolute",
    left: 10,
    right: 10,
    top: "50%",
    marginTop: -DOT_SIZE / 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "#000",
  },

  sizeLabel: {
    ...Typography.body20,
    color: Color.gray,
    textAlign: "center",
    marginBottom: 16,
  },
  primaryBtn: {
    alignSelf: "center",
    backgroundColor: Color.blue,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: Color.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryText: { color: Color.white, textAlign: "center" },
});
