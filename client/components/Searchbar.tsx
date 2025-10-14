// components/Searchbar.tsx  (aka FloatingSearch)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  level: string;              // "A1".."C2" or ""
  onChangeLevel: (lv: string) => void;
  onSubmit?: () => void;
  defaultExpanded?: boolean;
};

const DIFFICULTIES = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const cefrChipBg: Record<string, string> = {
  A1: "#F2B9DD",
  A2: "#FB7FC7",
  B1: "#F19DB8",
  B2: "#FB6C97",
  C1: "#C8A8E0",
  C2: "#AE7EDF",
};

export default function FloatingSearch({
  value,
  onChangeText,
  level,
  onChangeLevel,
  onSubmit,
  defaultExpanded = true,           // expand by default on desktop
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.wrapper}>
      {/* top row: input (only if expanded) + round button */}
      <View style={styles.row}>
        {expanded ? (
          <View style={styles.inputHolder}>
            <TextInput
              placeholder="Search by game name or code"
              value={value}
              onChangeText={onChangeText}
              returnKeyType="search"
              onSubmitEditing={() => onSubmit?.()}
            />
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (!expanded) setExpanded(true);
            else onSubmit?.();
          }}
          style={styles.fab}
        >
          <Text style={styles.fabIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* chips appear only when expanded */}
      {expanded && (
        <View style={styles.chipsRow}>
          {/* NEW: All tag to clear level filter only */}
          <TouchableOpacity
            style={styles.allChip}
            onPress={() => onChangeLevel("")}
            activeOpacity={0.9}
          >
            <Text style={styles.allText}>All</Text>
          </TouchableOpacity>

          {DIFFICULTIES.map((lv) => {
            const selected = level === lv;
            return (
              <TouchableOpacity
                key={lv}
                onPress={() => onChangeLevel(selected ? "" : lv)}
                activeOpacity={0.85}
                style={[
                  styles.chip,
                  { backgroundColor: cefrChipBg[lv] ?? "#eee" },
                  selected && styles.chipSelected,
                ]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {lv}
                </Text>
              </TouchableOpacity>
            );
          })}

          {(level || value) ? (
            <TouchableOpacity
              style={styles.clearChip}
              onPress={() => {
                onChangeText("");
                onChangeLevel("");
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", flexShrink: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  inputHolder: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6ECF1",
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    
  },
  fab: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#E6ECF1",
  },
  fabIcon: { fontSize: 18 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4, alignItems: "center" },

  allChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
    borderWidth: 1, borderColor: "#e3e3e3", backgroundColor: "#fff",
  },
  allText: { fontSize: 10, color: "#444", fontWeight: "600" },

  chip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
  },

  /* 🔧 add these back */
  chipSelected: {
    borderColor: "#4a90e2",
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: "#4F4F4F" },
  chipTextSelected: { color: "#1F2D3D", fontWeight: "700" },

  clearChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
    borderWidth: 1, borderColor: "#bbb", backgroundColor: "#fafafa",
  },
  clearText: { fontSize: 12, color: "#333" },
});
