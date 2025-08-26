import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { QuestionListSliderProps } from "../types/type";
import { Typography } from "@/theme/Font";

export default function QuestionListSlider({
  questionsAndAnswers,
  foundWords,
  showQuestion,
  activeIndex,
  onChangeIndex,
  revealedAnswers = [],
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

          <Text
            style={[styles.questionText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {activeIndex + 1}.{" "}
            {showQuestion ? currentQA.name : currentQA.answer}
          </Text>

          {showQuestion && (
            <>
              {found ? (
                <Text style={styles.answerText}>
                  Answer: {currentQA.answer}
                </Text>
              ) : revealedAnswers.includes(currentQA.answer) ? (
                <Text style={styles.hintText}>Hint: {currentQA.hint}</Text>
              ) : (
                <Text style={styles.hiddenAnswer}> </Text>
              )}
            </>
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
    backgroundColor: "rgba(249, 249, 249, 0.8)",
    padding: 10,
    borderRadius: 10,
  },
  questionText: {
    textAlign: "center",
    minWidth: 0,
    flexShrink: 1,
    ...Typography.header20,
  },
  found: {
    color: "green",
  },
  answerText: {
    color: "green",
    marginTop: 5,
    textAlign: "center",
    ...Typography.header20,
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
  hintText: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
    fontSize: 14,
  },
});
