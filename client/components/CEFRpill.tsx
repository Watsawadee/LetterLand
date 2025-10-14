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
import { getCEFRColor, CEFRLevel } from "@/theme/CEFR";

type Props = {
  level?: string | number | null;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  outlined?: boolean;
};

function CEFRBase({ level, label, style, textStyle, outlined }: Props) {
  const normalized = String(level ?? "").toUpperCase() as CEFRLevel;
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

export const CEFRPill = memo(CEFRBase);

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
