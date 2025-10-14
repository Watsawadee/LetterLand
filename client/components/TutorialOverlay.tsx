import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";

export type SpotlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Step = {
  id: string;
  title: string;
  description: string;
  rect: SpotlightRect | null;
};

type Props = {
  visible: boolean;
  steps: Step[];
  index: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
};

export default function TutorialOverlay({
  visible,
  steps,
  index,
  onNext,
  onPrev,
  onClose,
}: Props) {
  const [closing, setClosing] = useState(false);

  const handleSkip = useCallback(() => {
    if (closing) return;
    setClosing(true);
    onClose();
  }, [closing, onClose]);

  const handleNext = useCallback(() => {
    if (closing) return;
    onNext();
  }, [closing, onNext]);

  const handlePrev = useCallback(() => {
    if (closing) return;
    onPrev();
  }, [closing, onPrev]);

  useEffect(() => {
    if (visible) setClosing(false);
  }, [visible]);

  const step = steps[index];
  const spotlight = step?.rect;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const SPOTLIGHT_PADDING = 5;
  const SPOTLIGHT_RADIUS = 25;

  const screen = Dimensions.get("window");

  // Compute spotlight frame
  const spotlightFrame = useMemo(() => {
    if (!spotlight) return null;
    const x = clamp(spotlight.x - SPOTLIGHT_PADDING, 0, screen.width);
    const y = clamp(spotlight.y - SPOTLIGHT_PADDING, 0, screen.height);
    const w = clamp(
      spotlight.width + SPOTLIGHT_PADDING * 2,
      0,
      screen.width - x
    );
    const h = clamp(
      spotlight.height + SPOTLIGHT_PADDING * 2,
      0,
      screen.height - y
    );
    return { x, y, w, h };
  }, [spotlight, screen.height, screen.width]);

  // Tooltip placement
  const tooltipPlacement = useMemo(() => {
    if (!spotlightFrame)
      return { top: screen.height * 0.35, left: 20, right: 20 };

    const { x, y, w, h } = spotlightFrame;
    const spaceBelow = screen.height - (y + h);
    const top = spaceBelow > 180 ? y + h + 12 : Math.max(20, y - 150 - 12);

    let left = x;
    const maxWidth = 300;
    if (left + maxWidth > screen.width - 16) {
      left = screen.width - maxWidth - 16;
    }
    left = Math.max(16, left);

    return { top, left, right: undefined as number | undefined };
  }, [spotlightFrame, screen.height, screen.width]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents="box-none">
        {/* ===== Dim layer with rounded spotlight ===== */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={screen.width} height={screen.height}>
            <Defs>
              <Mask id="hole">
                {/* Show dim everywhere */}
                <Rect
                  x="0"
                  y="0"
                  width={screen.width}
                  height={screen.height}
                  fill="white"
                />
                {/* Hide dim in the spotlight area (the "hole") */}
                {spotlightFrame ? (
                  <Rect
                    x={spotlightFrame.x}
                    y={spotlightFrame.y}
                    width={spotlightFrame.w}
                    height={spotlightFrame.h}
                    rx={SPOTLIGHT_RADIUS}
                    ry={SPOTLIGHT_RADIUS}
                    fill="black"
                  />
                ) : null}
              </Mask>
            </Defs>

            {/* The semi-transparent dim that uses the mask */}
            <Rect
              x="0"
              y="0"
              width={screen.width}
              height={screen.height}
              fill="rgba(0,0,0,0.5)"
              mask="url(#hole)"
            />
          </Svg>
        </View>

        {/* ===== Tooltip card ===== */}
        <View style={[styles.card, tooltipPlacement]}>
          <Text style={styles.title}>{step?.title ?? "Tutorial"}</Text>
          <Text style={styles.desc}>{step?.description ?? ""}</Text>

          <View style={styles.row}>
            {index === 0 ? (
              <>
                <Pressable
                  style={[styles.btn, styles.secondary, styles.flexHalf]}
                  onPress={handleSkip}
                  disabled={closing}
                >
                  <Text style={styles.btnTextSecondary}>Skip</Text>
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.primary, styles.flexHalf]}
                  onPress={handleNext}
                  disabled={closing}
                >
                  <Text style={styles.btnTextPrimary}>Next</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.btn, styles.secondary, styles.flexThird]}
                  onPress={handleSkip}
                  disabled={closing}
                >
                  <Text style={styles.btnTextSecondary}>Skip</Text>
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.secondary, styles.flexThird]}
                  onPress={handlePrev}
                  disabled={closing}
                >
                  <Text style={styles.btnTextSecondary}>Back</Text>
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.primary, styles.flexThird]}
                  onPress={handleNext}
                  disabled={closing}
                >
                  <Text style={styles.btnTextPrimary}>
                    {index >= steps.length - 1 ? "Done" : "Next"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          <Text style={styles.progress}>
            {Math.min(index + 1, steps.length)} / {steps.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  card: {
    position: "absolute",
    backgroundColor: Color.white,
    borderRadius: 12,
    padding: 14,
    maxWidth: 300,
    width: "auto",
    shadowColor: Color.black,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: { ...Typography.header16, marginBottom: 4 },
  desc: { ...Typography.body16, color: Color.gray, lineHeight: 20 },
  flexHalf: { flex: 1, marginHorizontal: 6 },
  flexThird: { flex: 1, marginHorizontal: 4 },
  row: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: Color.blue },
  secondary: { backgroundColor: "#f0f2f5" },
  btnTextPrimary: {
    ...Typography.body16,
    color: Color.white,
    fontWeight: "bold",
  },
  btnTextSecondary: {
    ...Typography.body16,
    color: Color.gray,
    fontWeight: "bold",
  },
  progress: {
    ...Typography.body13,
    color: Color.gray,
    marginTop: 8,
    textAlign: "right",
  },
});
