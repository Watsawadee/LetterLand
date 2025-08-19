import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WordCard({ word, found }) {
  return (
    <View style={[styles.card, found && styles.foundCard]}>
      <Text style={[styles.text, found && styles.foundText]}>{word}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foundCard: {
    backgroundColor: "#d4edda",
    borderColor: "green",
  },
  text: {
    fontSize: 23,
    fontWeight: "600",
    color: "#333",
  },
  foundText: {
    color: "green",
  },
});
