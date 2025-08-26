import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import GameControls from "./GameControls";
import GameBoard from "./GameBoard";
import CluesPanel from "./CluesPanel";
import GameEndModal from "./GameEndModal";
import ConfirmModal from "./ConfirmModal";
import { useRouter } from "expo-router";
import { useGameLogic } from "../hooks/useGameLogic";
import { GameProps } from "../types/type";
import { useHints } from "../hooks/useHints";
import { useAllFound } from "../hooks/useAllFound";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import Retry from "../assets/icon/Restart";
import ArrowRight from "@/assets/icon/ArrowRight";

export default function SharedGameScreen({
  mode,
  title,
  CELL_SIZE,
  GRID_SIZE,
  questionsAndAnswers,
  gameData,
}: GameProps) {
  const router = useRouter();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const {
    grid,
    selectedCells,
    foundWords,
    hintCell,
    fontSettings,
    resetGame,
    showHintForAnswer,
    layoutRef,
    panResponder,
    revealedAnswers,
  } = useGameLogic({ GRID_SIZE, CELL_SIZE, questionsAndAnswers, mode });

  const foundWordsList = useMemo(
    () => foundWords.map((fw) => fw.word),
    [foundWords]
  );
  const allAnswers = useMemo(
    () => questionsAndAnswers.map((q) => q.answer),
    [questionsAndAnswers]
  );

  const { visible: allFoundVisible, setVisible: setAllFoundVisible } =
    useAllFound(allAnswers, foundWordsList);

  const { hintCount, isHintDisabled, onShowHint, clearActiveHint, resetHints } =
    useHints({
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
    setTimeUp(false);
  };

  const handleBackPress = () => setConfirmExitVisible(true);
  const handleExitConfirm = () => router.replace("/");
  const handleExitCancel = () => setConfirmExitVisible(false);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftColumn}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft />
          </TouchableOpacity>

          <GameControls
            title={title}
            fontSettings={fontSettings}
            onShowHint={onShowHint}
            hintCount={hintCount ?? 0}
            isHintDisabled={isHintDisabled}
            startTimeSeconds={gameData?.timer ?? 0}
            onTimeUp={() => setTimeUp(true)}
            key={activeQuestionIndex + (timeUp ? "timeUp" : "running")}
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
            panHandlers={timeUp ? {} : panResponder.panHandlers}
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

      <ConfirmModal
        visible={confirmExitVisible}
        message="If you exit now, your progress in this grid will be lost. Are you sure?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />

      {/* All Found MODAL */}
      <GameEndModal
        visible={allFoundVisible}
        title="EXCELLENT!"
        message="You have found all the words on time!"
        onConfirm={handleCloseModal}
        onClose={() => router.replace("/")}
        confirmIcon={<Retry />}
        closeIcon={<ArrowRight />}
      />

      {/* TIME UP MODAL */}
      <GameEndModal
        visible={timeUp}
        title="Time's Up!"
        message="You can no longer continue the game."
        onConfirm={handleCloseModal}
        onClose={() => router.replace("/")}
        confirmIcon={<Retry />}
        closeIcon={<ArrowRight />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "flex-start" },
  topRow: { flexDirection: "row", flex: 1, marginBottom: 10 },
  leftColumn: { width: 300, justifyContent: "center", marginRight: 30 },
  rightColumn: { flex: 1, marginTop: 20, justifyContent: "center" },
  itemWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(249, 249, 249, 0.8)",
    borderRadius: 50,
  },
});
