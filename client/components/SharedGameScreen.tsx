import React, { useMemo, useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import GameControls, { GameControlsHandle } from "./GameControls";
import GameBoard, { GameBoardHandle } from "./GameBoard";
import CluesPanel, { CluesPanelHandle } from "./CluesPanel";
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
import {
  fetchGamePronunciations,
  invalidatePronunciationsCache,
} from "@/services/pronunciationService";
import {
  saveFoundWordsOnce,
  completeGame,
  recordExtraWord,
} from "@/services/gameService";
import { deleteIncompleteGame } from "@/services/gameService";
import { getLoggedInUserId } from "@/utils/auth";
import { isValidEnglishWord } from "@/services/dictionaryService";
import SideToolBar, { SideToolBarHandle } from "./SideToolBar";
import HintShopModal from "../components/HintShopModal";
import FontSizeModal from "./FontSizeModal";
import { Typography } from "@/theme/Font";
import { Color } from "@/theme/Color";
import TutorialOverlay from "./TutorialOverlay";
import { useTutorial, useGameTutorial } from "@/hooks/useTutorial";

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

  const [alreadyFinished, setAlreadyFinished] = useState(false);

  const [roundKey, setRoundKey] = useState(0);
  const startedAtRef = useRef<number>(Date.now());

  const hasPostedWordsRef = useRef(false);
  const hasPostedCompleteRef = useRef(false);

  const restartLockRef = useRef(false);
  const [resetting, setResetting] = useState(false);

  const [extraWords, setExtraWords] = useState<string[]>([]);
  const extraWordSetRef = useRef<Set<string>>(new Set());
  const [toast, setToast] = useState<{ visible: boolean; text: string }>({
    visible: false,
    text: "",
  });
  const [extraCoinsEarned, setExtraCoinsEarned] = useState(0);
  const [shopVisible, setShopVisible] = useState(false);
  const controlsRef = useRef<GameControlsHandle | null>(null);
  const boardRef = useRef<GameBoardHandle | null>(null);
  const cluesRef = useRef<CluesPanelHandle | null>(null);
  const sideToolRef = useRef<SideToolBarHandle | null>(null);

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
  const allAnswersLower = useMemo(() => {
    const s = new Set<string>();
    for (const a of allAnswers)
      s.add(
        String(a || "")
          .trim()
          .toLowerCase()
      );
    return s;
  }, [allAnswers]);

  const foundWordsListRef = useRef<string[]>(foundWordsList);
  useEffect(() => {
    foundWordsListRef.current = foundWordsList;
  }, [foundWordsList]);

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

    foundWordsListRef.current = [];
    setExtraWords([]);
    extraWordSetRef.current = new Set();
    setToast({ visible: false, text: "" });
    setExtraCoinsEarned(0);
    setAwardedCoins(null);
    setUsedSeconds(null);
    hasPostedWordsRef.current = false;
    hasPostedCompleteRef.current = false;

    if (gameData?.id != null) invalidatePronunciationsCache(gameData.id);

    resetGame();
    setActiveQuestionIndex(0);
    clearActiveHint();
    resetHints();
    setAwardedCoins(null);
    setUsedSeconds(null);
    hasPostedWordsRef.current = false;
    hasPostedCompleteRef.current = false;
    startedAtRef.current = Date.now();

    setExtraWords([]);
    extraWordSetRef.current = new Set();
    setToast({ visible: false, text: "" });
    setExtraCoinsEarned(0);

    setRoundKey((k) => k + 1);

    setTimeout(() => {
      restartLockRef.current = false;
      setResetting(false);
    }, 0);
  };

  const handleBackPress = () => setConfirmExitVisible(true);
  const handleExitConfirm = async () => {
    setConfirmExitVisible(false);

    const notFinished = !(allFoundVisible || timeUp);
    if (notFinished && gameData?.id) {
      try {
        const uid = Number(await getLoggedInUserId());
        if (Number.isFinite(uid)) {
          await deleteIncompleteGame(gameData.id, uid);
          console.log("delete game", gameData.id);
        }
      } catch (e) {
        console.warn("[deleteIncompleteGame] failed:", e);
      }
    }
    router.replace("/Home");
  };
  const handleExitCancel = () => setConfirmExitVisible(false);

  const captureTimeUsedOnce = (): number => {
    const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
    const cap =
      typeof gameData?.timer === "number" && gameData.timer > 0
        ? Math.min(elapsed, gameData.timer)
        : elapsed;
    if (usedSeconds == null) setUsedSeconds(cap);
    return usedSeconds ?? cap;
  };

  const postCompletionOnce = async (opts?: { force?: boolean }) => {
    if (hasPostedCompleteRef.current && !opts?.force) return;
    const gameId = gameData?.id;
    if (!gameId) return;

    const completed = allFoundVisible || timeUp;
    const finishedOnTime = allFoundVisible && !timeUp;

    const seconds = captureTimeUsedOnce();
    const wordsLearned = foundWordsList.length;

    try {
      const res = await completeGame({
        gameId,
        completed,
        finishedOnTime,
        wordsLearned,
        timeUsedSeconds: seconds,
        extraWordsCount: extraWords.length,
        extraWords,
      });
      if (typeof res?.coinsAwarded === "number")
        setAwardedCoins(res.coinsAwarded);
      if (typeof res?.alreadyFinished === "boolean")
        setAlreadyFinished(res.alreadyFinished);
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
    setAlreadyFinished(false);
    startedAtRef.current = Date.now();

    setExtraWords([]);
    extraWordSetRef.current = new Set();
    setToast({ visible: false, text: "" });
    setExtraCoinsEarned(0);
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

  // Extra-word logic
  function buildWordFromCells(
    cells: Array<[number, number]>,
    matrix: string[][]
  ): string {
    try {
      return (cells || [])
        .map(([r, c]) => String(matrix?.[r]?.[c] ?? ""))
        .join("");
    } catch {
      return "";
    }
  }

  const baseHandlers = panResponder.panHandlers;
  const shouldBlock =
    timeUp || wordModalVisible || allFoundVisible || resetting;
  const wrappedHandlers = shouldBlock
    ? {}
    : {
        ...baseHandlers,
        onResponderRelease: (evt: any) => {
          const beforeFound = foundWordsListRef.current.length;
          const snapshotCells: any[] = Array.isArray(selectedCells)
            ? (selectedCells as any[]).slice()
            : Array.from((selectedCells as any) || []);
          const candidateRaw = buildWordFromCells(snapshotCells as any, grid);
          if (
            baseHandlers &&
            typeof baseHandlers.onResponderRelease === "function"
          )
            baseHandlers.onResponderRelease(evt);
          setTimeout(async () => {
            const afterFound = foundWordsListRef.current.length;
            if (afterFound === beforeFound) {
              const w = (candidateRaw || "").trim().toLowerCase();
              if (!w || w.length < 3) return;
              if (!/^[a-z]+$/.test(w)) return;
              if (allAnswersLower.has(w)) return;
              if (extraWordSetRef.current.has(w)) return;
              const learnedSet = new Set(
                (foundWordsListRef.current || []).map((s) =>
                  String(s).trim().toLowerCase()
                )
              );
              if (learnedSet.has(w)) return;
              let okEnglish = false;
              try {
                okEnglish = await isValidEnglishWord(w);
              } catch {
                okEnglish = false;
              }
              if (!okEnglish) return;
              try {
                if (gameData?.id) {
                  const resp = await recordExtraWord(gameData.id, w);
                  if (!resp) return;
                  if (resp.alreadyCounted) {
                    setToast({
                      visible: true,
                      text: `No coin: '${w.toUpperCase()}' already counted for this game`,
                    });
                    setTimeout(
                      () => setToast({ visible: false, text: "" }),
                      2000
                    );
                    return;
                  }
                  if (!extraWordSetRef.current.has(w)) {
                    extraWordSetRef.current.add(w);
                    setExtraWords((prev) => [...prev, w]);
                  }
                  const inc =
                    typeof resp.coinsAwarded === "number"
                      ? resp.coinsAwarded
                      : resp.created
                      ? 1
                      : 0;
                  if (inc > 0) {
                    setExtraCoinsEarned((c) => c + inc);
                    setToast({
                      visible: true,
                      text: `⭐ Extra word! (${w.toUpperCase()})  +${inc} coin`,
                    });
                    setTimeout(
                      () => setToast({ visible: false, text: "" }),
                      2000
                    );
                  }
                }
              } catch {}
            }
          }, 0);
        },
      };

  // ===== Tutorial integration =====
  const tutorial = useTutorial();
  const { openTutorial } = useGameTutorial({
    mode,
    gameData,
    tutorial,
    controlsRef,
    boardRef,
    cluesRef,
    sideToolRef,
  });
  const tutorialBlocking = tutorial.visible;

  const endModalVisible =
    !resetting &&
    !wordModalVisible &&
    (allFoundVisible || (timeUp && hasTimer));
  const endVariant = allFoundVisible ? "success" : "timeout";


  return (
    <View style={styles.container}>
      {toast.visible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.text}</Text>
        </View>
      )}

      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <ArrowLeft />
      </TouchableOpacity>

      <View
        style={styles.topRow}
        pointerEvents={tutorialBlocking ? "none" : "auto"}
      >
        <View style={styles.leftColumn}>
          <GameControls
            ref={controlsRef}
            title={title}
            gameCode={gameData?.gameTemplate?.gameCode}
            cefr={gameData?.gameTemplate?.difficulty}
            onShowHint={onShowHint}
            hintCount={hintCount ?? 0}
            isHintDisabled={isHintDisabled}
            startTimeSeconds={gameData?.timer ?? 0}
            onTimeUp={() => {
              if (hasTimer) setTimeUp(true);
            }}
            paused={
              tutorialBlocking ||
              allFoundVisible ||
              timeUp ||
              wordModalVisible ||
              resetting ||
              confirmExitVisible ||
              shopVisible ||
              fontSettings.fontModalVisible
            }
            resetKey={roundKey}
            onRequestBuyHints={() => setShopVisible(true)}
          />
        </View>

        <View style={styles.rightColumn}>
          <GameBoard
            ref={boardRef}
            grid={grid}
            CELL_SIZE={CELL_SIZE}
            selectedCells={selectedCells}
            foundWords={foundWords}
            hintCell={hintCell}
            fontSize={fontSettings.fontSize}
            panHandlers={tutorialBlocking ? {} : wrappedHandlers}
            layoutRef={layoutRef}
          />
        </View>
      </View>

      <View
        style={styles.itemWrapper}
        pointerEvents={tutorialBlocking ? "none" : "auto"}
      >
        <CluesPanel
          ref={cluesRef}
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
        message="You haven’t finished yet — leaving will delete your progress. Do you want to continue?"
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
          coinsEarned={awardedCoins}
          extraCoinsEarnedThisRun={extraCoinsEarned}
          wordsLearned={wordsLearnedCount}
          extraWordsCount={extraWords.length}
          alreadyFinished={alreadyFinished}
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
        extraWords={extraWords}
      />

      <FontSizeModal
        visible={fontSettings.fontModalVisible}
        tempFontSize={fontSettings.tempFontSize}
        setTempFontSize={fontSettings.setTempFontSize}
        onConfirm={() => {
          fontSettings.setFontSize(fontSettings.tempFontSize);
          fontSettings.setFontModalVisible(false);
        }}
        onClose={() => fontSettings.setFontModalVisible(false)}
      />

      <HintShopModal
        visible={shopVisible}
        onClose={() => setShopVisible(false)}
        onPurchased={() => {
          resetHints?.();
          setToast({ visible: true, text: `✨ Hint added!` });
          setTimeout(() => setToast({ visible: false, text: "" }), 1500);
          setShopVisible(false);
        }}
      />

      <SideToolBar
        ref={sideToolRef}
        onOpenFont={() => fontSettings.setFontModalVisible(true)}
        onOpenShop={() => setShopVisible(true)}
        onOpenTutorial={openTutorial}
        highlight={!tutorial.visible}
      />

      <TutorialOverlay
        visible={tutorial.visible}
        steps={tutorial.steps.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          rect: s.rect,
        }))}
        index={tutorial.index}
        onNext={async () => {
          if (!tutorial.visible) return;
          const step = tutorial.steps[tutorial.index];
          if (step?.id === "settings") {
            const opened =
              !!(await sideToolRef.current?.measureFont?.()) ||
              !!(await sideToolRef.current?.measureShop?.()) ||
              !!(await sideToolRef.current?.measureTutorial?.());
            if (!opened) return;
          }
          if (tutorial.index >= tutorial.steps.length - 1) tutorial.close();
          else tutorial.next();
        }}
        onPrev={tutorial.prev}
        onClose={tutorial.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "flex-start" },
  toast: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "#1f2937",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    opacity: 0.95,
  },
  toastText: { ...Typography.header13, color: Color.white },
  topRow: { flexDirection: "row", flex: 1, paddingBottom: 20 },
  leftColumn: { width: 280, justifyContent: "center", marginRight: 30 },
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
