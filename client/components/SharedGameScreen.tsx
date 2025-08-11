import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, Text, TouchableOpacity } from "react-native";
import GameControls from "./GameControls";
import GameBoard from "./GameBoard";
import QuestionListSlider from "./QuestionListSlider";
import WordCard from "./WordCard";
import { useRouter } from "expo-router";
import { useGameLogic } from "../hooks/useGameLogic";
import { GameProps } from "../types/type";

export default function SharedGameScreen({
  mode,
  title,
  CELL_SIZE,
  GRID_SIZE,
  questionsAndAnswers,
}: GameProps) {
  const router = useRouter();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isAllFoundModalVisible, setIsAllFoundModalVisible] = useState(false);
  const [hintCount, setHintCount] = useState(3);

  const {
    grid,
    selectedCells,
    foundWords,
    hintCell,
    fontSettings,
    confirmRestart,
    resetGame,
    showHintForAnswer,
    layoutRef,
    panResponder,
    revealedAnswers,
    activeHintWord,
  } = useGameLogic({ GRID_SIZE, CELL_SIZE, questionsAndAnswers, mode });

  const foundWordsList = foundWords.map((fw) => fw.word);

  useEffect(() => {
    const allFound = questionsAndAnswers.every((qa) =>
      foundWordsList.includes(qa.answer)
    );

    if (allFound) {
      const timeout = setTimeout(() => {
        setIsAllFoundModalVisible(true);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [foundWordsList, questionsAndAnswers]);

  const [lastHintIndex, setLastHintIndex] = useState(-1);
  const isHintDisabled =
    hintCount <= 0 ||
    (mode === "crossword_search" &&
      revealedAnswers.includes(
        questionsAndAnswers[activeQuestionIndex].answer
      )) ||
    (mode === "wordsearch" && activeHintWord !== null);

  const onShowHint = () => {
    if (hintCount <= 0) return;

    if (mode === "crossword_search") {
      const currentQA = questionsAndAnswers[activeQuestionIndex];
      if (!currentQA) return;

      if (revealedAnswers.includes(currentQA.answer)) {
        return;
      }

      showHintForAnswer(currentQA.answer);
      setHintCount((prev) => prev - 1);
    } else {
      const total = questionsAndAnswers.length;
      for (let offset = 1; offset <= total; offset++) {
        const nextIndex = (lastHintIndex + offset) % total;
        const nextAnswer = questionsAndAnswers[nextIndex].answer;
        if (!foundWordsList.includes(nextAnswer)) {
          showHintForAnswer(nextAnswer);
          setLastHintIndex(nextIndex);
          setHintCount((prev) => prev - 1);
          return;
        }
      }
    }
  };

  const handleCloseModal = () => {
    setIsAllFoundModalVisible(false);
    resetGame();
    setActiveQuestionIndex(0);
    setLastHintIndex(-1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftColumn}>
          <GameControls
            title={title}
            fontSettings={fontSettings}
            confirmRestart={confirmRestart}
            onRetryConfirm={handleCloseModal}
            onShowHint={onShowHint}
            onBackHome={() => router.replace("/")}
            hintCount={hintCount}
            isHintDisabled={isHintDisabled}
          />
        </View>

        <View style={styles.rightColumn}>
          <GameBoard
            grid={grid}
            CELL_SIZE={CELL_SIZE}
            selectedCells={selectedCells}
            foundWords={foundWords}
            hintCell={hintCell}
            fontSize={fontSettings.fontSize}
            panHandlers={panResponder.panHandlers}
            layoutRef={layoutRef}
          />
        </View>
      </View>

      <View style={styles.itemWrapper}>
        {mode === "crossword_search" ? (
          <QuestionListSlider
            questionsAndAnswers={questionsAndAnswers}
            foundWords={foundWordsList}
            showQuestion
            activeIndex={activeQuestionIndex}
            onChangeIndex={setActiveQuestionIndex}
            revealedAnswers={revealedAnswers}
          />
        ) : (
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
        )}
      </View>

      <Modal
        visible={isAllFoundModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              🎉 Congratulations! You found all words! 🎉
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  topRow: {
    flexDirection: "row",
    flex: 1,
    marginBottom: 10,
  },
  leftColumn: {
    width: 300,
    justifyContent: "center",
    marginRight: 30,
  },
  rightColumn: {
    flex: 1,
    marginTop: 20,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
  itemWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  wordListWrapper: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  wordRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
});
