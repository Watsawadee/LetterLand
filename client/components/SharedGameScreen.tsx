import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import GameControls from "./GameControls";
import GameBoard from "./GameBoard";
import CluesPanel from "./CluesPanel";
import AllFoundModal from "./AllFoundModal";
import { useRouter } from "expo-router";
import { useGameLogic } from "../hooks/useGameLogic";
import { GameProps } from "../types/type";
import { useHints } from "../hooks/useHints";
import { useAllFound } from "../hooks/useAllFound";

export default function SharedGameScreen({
  mode,
  title,
  CELL_SIZE,
  GRID_SIZE,
  questionsAndAnswers,
}: GameProps) {
  const router = useRouter();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

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
  } = useGameLogic({ GRID_SIZE, CELL_SIZE, questionsAndAnswers, mode });

  const foundWordsList = useMemo(() => foundWords.map((fw) => fw.word), [foundWords]);
  const allAnswers = useMemo(() => questionsAndAnswers.map((q) => q.answer), [questionsAndAnswers]);

  const { visible: allFoundVisible, setVisible: setAllFoundVisible } = useAllFound(allAnswers, foundWordsList);

  const { hintCount, isHintDisabled, onShowHint, clearActiveHint, resetHints } = useHints({
    mode,
    questionsAndAnswers,
    foundWordsList,
    revealedAnswers,
    activeQuestionIndex,
    showHintForAnswer,
  });

  const handleCloseModal = () => {
    setAllFoundVisible(false);
    resetGame();
    setActiveQuestionIndex(0);
    clearActiveHint();
    resetHints();
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
            startTimeSeconds={3000}
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
        <CluesPanel
          mode={mode}
          questionsAndAnswers={questionsAndAnswers}
          foundWordsList={foundWordsList}
          activeIndex={activeQuestionIndex}
          onChangeIndex={setActiveQuestionIndex}
          revealedAnswers={revealedAnswers}
        />
      </View>

      <AllFoundModal visible={allFoundVisible} onClose={handleCloseModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "flex-start" },
  topRow: { flexDirection: "row", flex: 1, marginBottom: 10 },
  leftColumn: { width: 300, justifyContent: "center", marginRight: 30 },
  rightColumn: { flex: 1, marginTop: 20, justifyContent: "center" },
  itemWrapper: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
});