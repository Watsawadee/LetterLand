import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import WordCard from "./WordCard";
import QuestionListSlider from "./QuestionListSlider";
import { CluesProps } from "../types/type";

export type CluesPanelHandle = {
  measureClues: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
};

function measure(ref: React.RefObject<View | null>) {
  return new Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>((resolve) => {
    const node = ref.current as View | null;
    if (!node) return resolve(null);
    (node as any).measureInWindow?.(
      (x: number, y: number, w: number, h: number) =>
        resolve({ x, y, width: w, height: h })
    );
    setTimeout(() => resolve(null), 120);
  });
}

const CluesPanel = forwardRef<CluesPanelHandle, CluesProps>(function CluesPanel(
  props,
  ref
) {
  const {
    mode,
    questionsAndAnswers,
    foundWordsList,
    activeIndex,
    onChangeIndex,
    revealedAnswers,
  } = props;

  const wrapRef = useRef<View>(null);
  useImperativeHandle(ref, () => ({ measureClues: () => measure(wrapRef) }));

  if (mode === "CROSSWORD_SEARCH") {
    return (
      <View ref={wrapRef}>
        <QuestionListSlider
          questionsAndAnswers={questionsAndAnswers}
          foundWords={foundWordsList}
          showQuestion
          activeIndex={activeIndex}
          onChangeIndex={onChangeIndex}
          revealedAnswers={revealedAnswers}
        />
      </View>
    );
  }

  return (
    <View ref={wrapRef} style={styles.wordListWrapper}>
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
});

export default CluesPanel;

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
  wordRow: { alignItems: "center", paddingRight: 8 },
});
