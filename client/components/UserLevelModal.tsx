import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import GreenTape from "@/assets/icon/GreenTape";
import { CEFRLevel, getCEFRColor } from "@/theme/CEFR";
import { useRouter } from "expo-router";

type Props = {
  visible: boolean;
  level: CEFRLevel;
  onConfirm: () => void;
  onRequestClose?: () => void;
};

const LEVEL: Record<CEFRLevel, { label: string; detail: string }> = {
  A1: {
    label: "Beginner level",
    detail:
      "A1 is the beginner level: you can understand and use very simple phrases in everyday situations.",
  },
  A2: {
    label: "Elementary level",
    detail:
      "A2 means you can communicate in simple tasks and describe your background and immediate needs.",
  },
  B1: {
    label: "Intermediate level",
    detail:
      "B1 users can handle familiar matters in school/work and describe experiences, dreams and plans.",
  },
  B2: {
    label: "Upper-intermediate level",
    detail:
      "B2 means you can interact with fluency on a wide range of topics and produce clear, detailed text.",
  },
  C1: {
    label: "Advanced level",
    detail:
      "C1 users understand demanding texts and express ideas fluently for social, academic or professional use.",
  },
  C2: {
    label: "Mastery level",
    detail:
      "C2 indicates near-native command with precise, nuanced understanding and expression.",
  },
};

export default function UserLevelModal({
  visible,
  level,
  onConfirm,
  onRequestClose,
}: Props) {
  const levelColor = getCEFRColor(level);
  const { label, detail } = LEVEL[level];
  const TAB = "\u2003\u2003";
  const router = useRouter();
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose}
    >
      <View style={styles.backdrop}>
        {/* Tap outside to close if handler provided */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} />

        <View style={styles.card} pointerEvents="box-none">
          <GreenTape pointerEvents="none" style={styles.tape} />
          <View style={styles.content}>
            <Text style={styles.title}>Your CEFR level</Text>

            {/* Big level badge */}
            <View style={[styles.badge, { backgroundColor: levelColor }]}>
              <Text style={[styles.badgeLevel]}>{level}</Text>
              <Text style={styles.badgeLabel}>{label}</Text>
            </View>

            {/* Section 1 */}
            <Text style={styles.sectionTitle}>What is CEFR level ?</Text>
            <View style={[styles.hr]} />
            <Text style={styles.body}>
              {TAB} The CEFR (Common European Framework of Reference for
              Languages) is an international system that shows how well you can
              understand and use a language.
            </Text>

            {/* Section 2 */}
            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
              What does {level} mean ?
            </Text>
            <View style={[styles.hr]} />
            <Text style={styles.body}>
              {TAB} {detail}
            </Text>

            {/* CTA */}
            <Pressable
              onPress={() => {
                onConfirm?.();
                router.replace("/authentication/login");
              }}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: Color.blue, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.ctaText}>Let’s goooo</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const CARD_W = 560;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Color.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: CARD_W,
    borderRadius: 18,
    backgroundColor: Color.white,
    paddingHorizontal: 45,
    paddingTop: 30,
    paddingBottom: 22,
  },
  content: {
    zIndex: 1,
  },
  tape: {
    position: "absolute",
    top: -2,
    left: -35,
    transform: [{ rotate: "-27deg" }],
    zIndex: 0,
  },
  title: {
    ...Typography.header30,
    textAlign: "center",
    color: Color.blue,
    marginBottom: 23,
  },
  badge: {
    alignSelf: "center",
    minWidth: 160,
    height: 130,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badgeLevel: {
    ...Typography.header45,
    color: Color.white,
    letterSpacing: 1,
  },
  badgeLabel: {
    ...Typography.header13,
    color: Color.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  sectionTitle: {
    ...Typography.popupbody20,
    color: Color.black,
    marginTop: 10,
  },
  hr: {
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Color.lightgreen,
  },
  body: {
    ...Typography.body16,
    lineHeight: 20,
    color: Color.gray,
  },
  cta: {
    marginTop: 45,
    alignSelf: "center",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaText: {
    color: Color.white,
    ...Typography.header20,
  },
});