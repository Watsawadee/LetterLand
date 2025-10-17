import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { QuestionListSliderProps } from "../types/type";
import { Typography } from "@/theme/Font";
import { Color } from "@/theme/Color";

function computeRevealCount(letterCount: number): number {
  if (letterCount <= 4) return 1;
  if (letterCount <= 6) return 2;
  if (letterCount <= 9) return 3;
  if (letterCount <= 12) return 4;
  return Math.min(5, Math.max(1, Math.floor(letterCount * 0.3)));
}

function maskAnswerRandom(answerRaw: string): string {
  const answer = answerRaw ?? "";
  const chars = Array.from(answer);

  const letterIdxs: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    if (/[A-Za-z]/.test(chars[i])) letterIdxs.push(i);
  }
  const L = letterIdxs.length;
  if (L === 0) return answer;

  const revealCount = Math.min(computeRevealCount(L), L);

  const shuffled = [...letterIdxs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, revealCount).sort((a, b) => a - b);
  const revealSet = new Set<number>(selected);

  const masked = chars.map((ch, i) => {
    if (!/[A-Za-z]/.test(ch)) return ch;
    return revealSet.has(i) ? ch : "_";
  });

  const pretty: string[] = [];
  for (let i = 0; i < masked.length; i++) {
    const ch = masked[i];
    const prev = i > 0 ? masked[i - 1] : "";
    if (i > 0 && /[A-Za-z_]/.test(ch) && /[A-Za-z_]/.test(prev)) {
      pretty.push(" ");
    }
    pretty.push(ch);
  }
  return pretty.join("");
}

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

  const shouldShowHint =
    showQuestion && !found && revealedAnswers.includes(currentQA.answer);

  const maskedHint = useMemo(
    () => (shouldShowHint ? maskAnswerRandom(currentQA.answer) : ""),
    [shouldShowHint, currentQA.answer]
  );

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
            style={styles.questionText}
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
              ) : shouldShowHint ? (
                <Text
                  style={styles.hintText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Hint: {maskedHint}
                </Text>
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
    marginBottom: 2,
    minWidth: "100%",
    backgroundColor: "rgba(249, 249, 249, 0.88)",
    padding: 9,
    borderRadius: 10,
  },
  questionText: {
    textAlign: "center",
    minWidth: 0,
    flexShrink: 1,
    ...Typography.header20,
  },
  answerText: {
    color: "#548D60",
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
    fontSize: 30,
    color: Color.black,
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
    backgroundColor: "#F9F7F2",
    marginHorizontal: 7,
  },
  hiddenAnswer: {
    color: "transparent",
  },
  hintText: {
    marginTop: 8,
    color: Color.grey,
    textAlign: "center",
    fontSize: 20,
  },
});
