import React from "react";
import { View, StyleSheet, Text } from "react-native";
import WordCard from "./WordCard";
import QuestionListSlider from "./QuestionListSlider";
import { CluesProps } from "../types/type";

export default function CluesPanel(props: CluesProps) {
  const {
    mode,
    questionsAndAnswers,
    foundWordsList,
    activeIndex,
    onChangeIndex,
    revealedAnswers,
  } = props;
  if (mode === "CROSSWORD_SEARCH") {
    return (
      <QuestionListSlider
        questionsAndAnswers={questionsAndAnswers}
        foundWords={foundWordsList}
        showQuestion
        activeIndex={activeIndex}
        onChangeIndex={onChangeIndex}
        revealedAnswers={revealedAnswers}
      />
    );
  }

  return (
    <View
      style={[
        styles.wordListWrapper,
        { flexDirection: "row", flexWrap: "wrap" },
      ]}
    >
      {questionsAndAnswers.map(({ answer }) => (
        <WordCard
          key={answer}
          word={answer}
          found={foundWordsList.includes(answer)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wordListWrapper: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  crosswordList: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
  },
  clue: {
    fontSize: 16,
    paddingVertical: 6,
  },
  clueFound: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
