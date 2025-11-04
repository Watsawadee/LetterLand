// components/Searchbar.tsx (FloatingSearch)
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Search from "@/assets/icon/Search"

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  level: string; // "A1".."C2" or ""
  onChangeLevel: (lv: string) => void;
  onSubmit?: () => void;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void; // NEW PROP
};

// CEFR levels
const DIFFICULTIES = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

// CEFR color mapping
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
  defaultExpanded = false,
  onExpandChange, // NEW PROP
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const widthAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for expanding / collapsing search bar
  useEffect(() => {
    if (expanded) {
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Notify parent about expansion state
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);

  const handleCirclePress = () => setExpanded(!expanded);

  // Animate width from small circle → full bar
  const containerWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["17%", "100%"], // expand to full width
  });


  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { width: containerWidth }]}>
        {/* --- Top section --- */}
        <View style={styles.topRow}>
  {expanded ? (
    <Animated.View style={[styles.inputHolder, { opacity: fadeAnim }]}>
      <TextInput
        placeholder="Search by game name or code"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit?.()}
        style={styles.input}
        autoFocus
      />
    </Animated.View>
  ) : null}

  <TouchableOpacity
    activeOpacity={0.85}
    onPress={handleCirclePress}
    style={styles.fab}
  >
    <Search width={26} height={26} />
  </TouchableOpacity>
</View>

        {/* --- CEFR filter chips --- */}
        {expanded && (
          <Animated.View style={[styles.chipsRow, { opacity: fadeAnim }]}>

            {/* CEFR chips */}
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
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {lv}
                  </Text>
                </TouchableOpacity>
              );
            })}

          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outer wrapper aligning the whole search to the right
  wrapper: {
    width: "100%",
    alignItems: "flex-end",
  },

  // Container (animated width box)
  container: {
    // no fixed background; width animated
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    backgroundColor: "white", 
    borderRadius: 45,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  inputHolder: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
  },

  // Text inside the input
  input: {
    fontSize: 14,
    color: "#333",
  },

// Circle search button
fab: {
  width: 56,              // equal sides -> perfect circle
  height: 56,
  borderRadius: 28,       // half of width/height
  alignItems: "center",
  justifyContent: "center",


},

  // Magnifying glass icon
  fabIcon: {
    fontSize: 24,
    textAlign: "center", // center horizontally
    textAlignVertical: "center", // center vertically (Android)
   
  },

  // Chips container (below search)
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  // "All" chip
  allChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#4a90e2",
    backgroundColor: "#fff",
  },
  allChipSelected: {
    borderColor: "#4a90e2",
    backgroundColor: "#4a90e2",
  },
  allText: {
    fontSize: 11,
    color: "#4a90e2",
    fontWeight: "700",
  },
  allTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },

  // CEFR chips
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    borderColor: "rgba(0,0,0,0.15)",
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffff",
  },
  chipTextSelected: {
    color: "#333",
    fontWeight: "700",
  },
});