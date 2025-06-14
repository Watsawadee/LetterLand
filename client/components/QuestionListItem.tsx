import React from "react";
import { Text, StyleSheet } from "react-native";
import { QuestionAnswer } from "../data/gameData";

interface Props {
  item: QuestionAnswer;
  found: boolean;
  showQuestion: boolean;
}

export default function QuestionListItem({ item, found, showQuestion }: Props) {
  return (
    <Text style={styles.text}>
      {showQuestion ? item.question : item.answer}
      {found && <Text style={styles.foundMark}> ✓</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16, marginVertical: 5 },
  foundMark: { color: "green" },
});
