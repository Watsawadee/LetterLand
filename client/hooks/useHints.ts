import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseHintsArgs, QuestionAnswer } from "../types/type";
import { getUserData, useHint } from "../services/gameService";
import { getLoggedInUserId } from "../utils/auth";

type Mode = "WORD_SEARCH" | "CROSSWORD_SEARCH";

function norm(s: string) {
  return String(s ?? "")
    .trim()
    .toUpperCase();
}

export function useHints(
  args: UseHintsArgs & {
    mode: Mode;
    gameId?: number | string;
    questionsAndAnswers?: QuestionAnswer[];
    activeQuestionIndex?: number;
    foundWordsList?: string[];
    revealedAnswers?: string[];
    showHintForAnswer?: (answer: string) => void;
    initialHints?: number;
  }
) {
  const {
    mode,
    gameId,
    questionsAndAnswers = [],
    activeQuestionIndex = 0,
    foundWordsList = [],
    revealedAnswers = [],
    showHintForAnswer,
    initialHints,
  } = (args || {}) as any;

  const [hintCount, setHintCount] = useState<number>(initialHints ?? 0);

  useEffect(() => {
    (async () => {
      try {
        const uid = await getLoggedInUserId();
        if (!uid) return;
        const u = await getUserData(Number(uid));
        const h = Number(u?.hint ?? 0);
        if (!Number.isNaN(h)) setHintCount(h);
      } catch {
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof initialHints === "number") setHintCount(initialHints);
  }, [initialHints]);

  const setHintsCountFromShop = useCallback((newCount: number) => {
    setHintCount(Math.max(0, Number(newCount) || 0));
  }, []);

  // CROSSWORD: lock by clue
  const usedHintForAnswer = useRef<Set<string>>(new Set());

  const crosswordCurrentAnswer = useMemo(() => {
    const a = questionsAndAnswers[activeQuestionIndex]?.answer ?? "";
    return norm(a);
  }, [questionsAndAnswers, activeQuestionIndex]);

  const isDisabledCW = usedHintForAnswer.current.has(crosswordCurrentAnswer);

  // WORDSEARCH: one ACTIVE hint at a time
  const [activeHintWS, setActiveHintWS] = useState<string | null>(null);

  const satisfiedAnswersSet = useMemo(() => {
    const s = new Set<string>();
    for (const w of foundWordsList) s.add(norm(w));
    for (const r of revealedAnswers) s.add(norm(r));
    return s;
  }, [foundWordsList, revealedAnswers]);

  // When the hinted word is satisfied -> release the lock
  useEffect(() => {
    if (!activeHintWS) return;
    if (satisfiedAnswersSet.has(activeHintWS)) {
      setActiveHintWS(null);
    }
  }, [activeHintWS, satisfiedAnswersSet]);

  const isDisabledWS = activeHintWS !== null;

  const isHintDisabled =
    mode === "CROSSWORD_SEARCH" ? isDisabledCW : isDisabledWS;

  const onShowHint = useCallback(async () => {

    if (hintCount <= 0) return;

    if (mode === "CROSSWORD_SEARCH") {
      if (isDisabledCW) return;
    } else {
      if (isDisabledWS) return;
    }

    const uid = Number(await getLoggedInUserId());
    const res = await useHint(uid, gameId);
    setHintCount(res.remainingHints);

    if (mode === "CROSSWORD_SEARCH") {
      const answer = questionsAndAnswers[activeQuestionIndex]?.answer ?? "";
      if (!answer) return;
      showHintForAnswer?.(answer);
      usedHintForAnswer.current.add(norm(answer));
      return;
    }

    const unsatisfied = questionsAndAnswers
      .map((qa: QuestionAnswer) => qa.answer)
      .filter((ans: string) => !satisfiedAnswersSet.has(norm(ans)));

    if (activeHintWS && satisfiedAnswersSet.has(activeHintWS)) {
      setActiveHintWS(null);
    }

    if (unsatisfied.length === 0) return;

    const pick = unsatisfied[0];
    showHintForAnswer?.(pick);
    setActiveHintWS(norm(pick));
  }, [
    hintCount,
    mode,
    isDisabledCW,
    isDisabledWS,
    gameId,
    questionsAndAnswers,
    activeQuestionIndex,
    satisfiedAnswersSet,
    activeHintWS,
    showHintForAnswer,
  ]);

  const clearActiveHint = useCallback(() => setActiveHintWS(null), []);

  const resetHints = useCallback(() => {
    usedHintForAnswer.current = new Set();
    setActiveHintWS(null);
  }, []);

  return {
    hintCount,
    isHintDisabled,
    onShowHint,
    clearActiveHint,
    resetHints,
    setHintsCountFromShop,
  };
}
