import React, { memo } from "react";
import {
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const LEVEL_TO_COLOR: Record<CEFRLevel, string> = {
  A1: Color.A1,
  A2: Color.A2,
  B1: Color.B1,
  B2: Color.B2,
  C1: Color.C1,
  C2: Color.C2,
};

export function getCEFRColor(
  level?: string | number | null,
  fallback = Color.gray500
) {
  if (!level) return fallback;
  const key = String(level).toUpperCase() as CEFRLevel;
  return LEVEL_TO_COLOR[key] ?? fallback;
}

type Props = {
  level?: string | number | null;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  outlined?: boolean;
};

function CEFRBase({ level, label, style, textStyle, outlined }: Props) {
  const normalized = String(level ?? "").toUpperCase();
  if (!normalized) return null;

  const color = getCEFRColor(normalized);

  const base = outlined
    ? [
        styles.pill,
        { borderColor: color, borderWidth: 1, backgroundColor: "transparent" },
        style,
      ]
    : [styles.pill, { backgroundColor: color }, style];

  const txt = outlined
    ? [styles.pillText, { color }, textStyle]
    : [styles.pillText, textStyle];

  return (
    <View style={base}>
      <Text style={txt}>{label ?? normalized}</Text>
    </View>
  );
}

export const CEFR = memo(CEFRBase);

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    ...Typography.header16,
    color: Color.white,
  },
});
