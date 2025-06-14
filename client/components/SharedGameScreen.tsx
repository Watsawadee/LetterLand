import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GameControls from "./GameControls";
import GameBoard from "./GameBoard";
import QuestionListItem from "./QuestionListItem";
import { useRouter } from "expo-router";
import { QuestionAnswer } from "../data/gameData";
import { useGameLogic } from "../hooks/useGameLogic";

type Props = {
  mode: "word" | "crossword";
  title: string;
  CELL_SIZE: number;
  GRID_SIZE: number;
  questionsAndAnswers: QuestionAnswer[];
};

export default function SharedGameScreen({
  mode,
  title,
  CELL_SIZE,
  GRID_SIZE,
  questionsAndAnswers,
}: Props) {
  const router = useRouter();

  const {
    grid,
    selectedCells,
    currentWord,
    foundWords,
    isCorrect,
    hintCell,
    fontModalVisible,
    fontSize,
    tempFontSize,
    confirmRestartVisible,
    setFontModalVisible,
    setTempFontSize,
    setFontSize,
    setConfirmRestartVisible,
    resetGame,
    showHint,
    layoutRef,
    panResponder,
  } = useGameLogic({
    GRID_SIZE,
    CELL_SIZE,
    questionsAndAnswers,
    mode,
  });

  return (
    <View style={styles.container}>
      <GameControls
        title={title}
        confirmRestartVisible={confirmRestartVisible}
        fontModalVisible={fontModalVisible}
        tempFontSize={tempFontSize}
        setTempFontSize={setTempFontSize}
        setFontSize={setFontSize}
        setFontModalVisible={setFontModalVisible}
        setConfirmRestartVisible={setConfirmRestartVisible}
        onRetryConfirm={resetGame}
        onShowHint={showHint}
        onFontSizePress={() => setFontModalVisible(true)}
        onBackHome={() => router.replace("/")}
      />

      <GameBoard
        grid={grid}
        CELL_SIZE={CELL_SIZE}
        selectedCells={selectedCells}
        foundWords={foundWords}
        hintCell={hintCell}
        fontSize={fontSize}
        questionsAndAnswers={questionsAndAnswers}
        panHandlers={panResponder.panHandlers}
        layoutRef={layoutRef}
        renderQuestionItem={(q: QuestionAnswer, found: boolean) => (
          <QuestionListItem
            key={q.answer}
            item={q}
            found={found}
            showQuestion={mode === "crossword"}
          />
        )}
      />

      {currentWord !== "" ? (
        <Text
          style={[
            styles.currentWord,
            {
              color: isCorrect === null ? "#333" : isCorrect ? "green" : "red",
            },
          ]}
        >
          {currentWord}
        </Text>
      ) : (
        <Text style={styles.currentWord}> </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  currentWord: { fontSize: 22, marginTop: 10 },
});
