import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { QuestionListSliderProps } from "../types/type";

export default function QuestionListSlider({
  questionsAndAnswers,
  foundWords,
  showQuestion,
  activeIndex,
  onChangeIndex,
}: QuestionListSliderProps) {
  const currentQA = questionsAndAnswers[activeIndex];
  const found = foundWords.includes(currentQA.answer);

  const changeIndex = (direction: -1 | 1) => {
    let newIndex = activeIndex + direction;
    const len = questionsAndAnswers.length;

    if (newIndex < 0) {
      newIndex = len - 1;
    } else if (newIndex >= len) {
      newIndex = 0;
    }

    onChangeIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={() => changeIndex(-1)}
          style={styles.arrowButton}
        >
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.questionInfo}>
          <Text style={styles.questionNumber}>
            Question {activeIndex + 1} / {questionsAndAnswers.length}
          </Text>

          <Text
            style={[styles.questionText, found && styles.found]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {showQuestion ? currentQA.question : currentQA.answer}
            {found && " ✓"}
          </Text>

          {showQuestion && (
            <Text style={[styles.answerText, !found && styles.hiddenAnswer]}>
              {found ? `Answer: ${currentQA.answer}` : " "}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => changeIndex(1)}
          style={styles.arrowButton}
        >
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dotsContainer}>
        {questionsAndAnswers.map(({ answer }, idx) => {
          const isFound = foundWords.includes(answer);
          const isActive = idx === activeIndex;

          let backgroundColor = "gray";
          if (isActive) backgroundColor = "black";
          else if (isFound) backgroundColor = "green";

          return (
            <TouchableOpacity
              key={answer}
              onPress={() => onChangeIndex(idx)}
              style={[styles.dot, { backgroundColor }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
    minWidth: "100%",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
  },
  questionNumber: {
    color: "gray",
    marginBottom: 3,
    textAlign: "center",
    fontSize: 14,
  },
  questionText: {
    textAlign: "center",
    fontSize: 18,
    minWidth: 0,
    flexShrink: 1,
  },
  found: {
    color: "green",
  },
  answerText: {
    fontSize: 16,
    color: "green",
    marginTop: 5,
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  disabled: {
    opacity: 0.3,
  },
  arrow: {
    fontSize: 24,
    color: "blue",
  },
  questionInfo: {
    flex: 1,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "lightgray",
    marginHorizontal: 7,
  },
  hiddenAnswer: {
    color: "transparent",
  },
});
