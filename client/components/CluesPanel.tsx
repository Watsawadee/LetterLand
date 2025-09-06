import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
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
    <View style={styles.wordListWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.wordRow}
      >
        {questionsAndAnswers.map(({ answer }) => (
          <WordCard
            key={answer}
            word={answer}
            found={foundWordsList.includes(answer)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const ROW_HEIGHT = 75;

const styles = StyleSheet.create({
  wordListWrapper: {
    height: ROW_HEIGHT,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(249, 249, 249, 0.8)",
  },
  wordRow: {
    alignItems: "center",
    paddingRight: 8,
  },
});
