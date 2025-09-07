import React, { useMemo, useState, useRef, useEffect } from "react";
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
import Restart from "../assets/icon/Restart";
import ArrowRight from "@/assets/icon/ArrowRight";
import WordLearnedModal from "./WordLearnedModal";
import { fetchGamePronunciations } from "@/services/pronunciationService";
import { saveFoundWordsOnce, completeGame } from "@/services/gameService";

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
  const [wordModalVisible, setWordModalVisible] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const [awardedCoins, setAwardedCoins] = useState<number | null>(null);
  const [usedSeconds, setUsedSeconds] = useState<number | null>(null);

  const [roundKey, setRoundKey] = useState(0);
  const startedAtRef = useRef<number>(Date.now());

  const hasPostedWordsRef = useRef(false);
  const hasPostedCompleteRef = useRef(false);

  const restartLockRef = useRef(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!gameData?.id) return;
    fetchGamePronunciations(gameData.id).catch(() => {});
  }, [gameData?.id]);

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
      gameId: gameData?.id,
      questionsAndAnswers,
      foundWordsList,
      revealedAnswers,
      activeQuestionIndex,
      showHintForAnswer,
    });

  const hasTimer = !!(gameData?.timer && gameData.timer > 0);

  const hardResetRound = () => {
    if (restartLockRef.current) return;
    restartLockRef.current = true;
    setResetting(true);

    setAllFoundVisible(false);
    setTimeUp(false);
    setWordModalVisible(false);

    resetGame();
    setActiveQuestionIndex(0);
    clearActiveHint();
    resetHints();
    setAwardedCoins(null);
    setUsedSeconds(null);
    hasPostedWordsRef.current = false;
    hasPostedCompleteRef.current = false;
    startedAtRef.current = Date.now();

    setRoundKey((k) => k + 1);

    setTimeout(() => {
      restartLockRef.current = false;
      setResetting(false);
    }, 0);
  };

  const handleBackPress = () => setConfirmExitVisible(true);
  const handleExitConfirm = () => router.replace("/Home");
  const handleExitCancel = () => setConfirmExitVisible(false);

  const captureTimeUsedOnce = () => {
    if (usedSeconds != null) return;
    const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
    const cap =
      typeof gameData?.timer === "number" && gameData.timer > 0
        ? Math.min(elapsed, gameData.timer)
        : elapsed;
    setUsedSeconds(cap);
  };

  const postCompletionOnce = async (opts?: { force?: boolean }) => {
    if (hasPostedCompleteRef.current && !opts?.force) return;
    const gameId = gameData?.id;
    if (!gameId) return;

    const completed = !!allFoundVisible;
    const finishedOnTime = completed && !timeUp;

    captureTimeUsedOnce();
    const wordsLearned = foundWordsList.length;

    try {
      const res = await completeGame({
        gameId,
        completed,
        finishedOnTime,
        wordsLearned,
        timeUsedSeconds: usedSeconds ?? 0,
      });
      if (typeof res?.coinsAwarded === "number") {
        setAwardedCoins(res.coinsAwarded);
      }
      hasPostedCompleteRef.current = true;
    } catch (e) {
      console.warn("[completeGame] post failed:", e);
    }
  };

  const openWordModal = async () => {
    try {
      await saveFoundWordsOnce(
        hasPostedWordsRef,
        gameData?.id,
        foundWordsList,
        questionsAndAnswers
      );
    } catch {}
    try {
      await postCompletionOnce();
    } catch {}

    setWordModalVisible(true);
    setTimeUp(false);
    setAllFoundVisible(false);
  };

  useEffect(() => {
    hasPostedWordsRef.current = false;
    hasPostedCompleteRef.current = false;
    setAwardedCoins(null);
    setUsedSeconds(null);
    startedAtRef.current = Date.now();
  }, [gameData?.id]);

  useEffect(() => {
    if (!(allFoundVisible || timeUp)) return;

    captureTimeUsedOnce();

    saveFoundWordsOnce(
      hasPostedWordsRef,
      gameData?.id,
      foundWordsList,
      questionsAndAnswers
    ).catch((err) => console.error("[wordfound] post failed:", err));

    postCompletionOnce().catch((err) =>
      console.error("[completeGame] post failed:", err)
    );
  }, [
    allFoundVisible,
    timeUp,
    gameData?.id,
    foundWordsList,
    questionsAndAnswers,
  ]);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [roundKey]);

  const wordsLearnedCount = foundWordsList.length;

  const endModalVisible = !resetting && !wordModalVisible && (allFoundVisible || (timeUp && hasTimer));
  const endVariant = allFoundVisible ? "success" : "timeout";

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
            onTimeUp={() => {
              if (hasTimer) setTimeUp(true);
            }}
            paused={allFoundVisible || timeUp || wordModalVisible || resetting}
            resetKey={roundKey}
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
            panHandlers={
              (timeUp || wordModalVisible || allFoundVisible || resetting)
                ? {}
                : panResponder.panHandlers
            }
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

      {endModalVisible && (
        <GameEndModal
          visible={endModalVisible}
          variant={endVariant}
          hasTimer={hasTimer}
          timeUsedSeconds={usedSeconds ?? undefined}
          coinsEarned={awardedCoins ?? undefined}
          wordsLearned={wordsLearnedCount}
          onRestart={hardResetRound}
          onContinue={openWordModal}
          restartIcon={<Restart />}
          continueIcon={<ArrowRight />}
        />
      )}

      <WordLearnedModal
        visible={wordModalVisible}
        onClose={() => router.replace("/Home")}
        gameId={gameData?.id ?? 0}
        words={foundWordsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "flex-start" },
  topRow: { flexDirection: "row", flex: 1, paddingBottom: 20 },
  leftColumn: { width: 300, justifyContent: "center", marginRight: 30 },
  rightColumn: { flex: 1, marginTop: 20, justifyContent: "center" },
  itemWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    alignSelf: "stretch",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: "#F9F7F2",
    borderRadius: 50,
  },
});
