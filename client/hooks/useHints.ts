import { useCallback, useMemo, useState, useEffect } from "react";
import { UseHintsArgs } from "../types/type";
import { getUserData, useHint } from "../services/gameService";
import { getLoggedInUserId } from "../utils/auth";

function norm(s: string) {
  return s.trim().toUpperCase();
}

export function useHints(args: UseHintsArgs & { gameId?: number | string }) {
  const {
    mode,
    gameId,
    questionsAndAnswers,
    foundWordsList,
    revealedAnswers,
    activeQuestionIndex,
    showHintForAnswer,
  } = args;

  const [hintCount, setHintCount] = useState<number | null>(null);
  const [lastHintIndex, setLastHintIndex] = useState(-1);
  const [activeHintWord, setActiveHintWord] = useState<string | null>(null);
  const [requiredFindWord, setRequiredFindWord] = useState<string | null>(null);

  const [hintedAnswers, setHintedAnswers] = useState<Set<string>>(new Set());

  const [userId, setUserId] = useState<string | null>(null);

  const foundSet = useMemo(
    () => new Set(foundWordsList.map(norm)),
    [foundWordsList]
  );
  const revealedSet = useMemo(
    () => new Set(revealedAnswers.map(norm)),
    [revealedAnswers]
  );

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getLoggedInUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchHints = async () => {
      try {
        const userData = await getUserData(Number(userId));
        setHintCount(userData.hint ?? 0);
      } catch (err) {
        console.error("Failed to fetch user hint count", err);
        setHintCount(0);
      }
    };
    fetchHints();
  }, [userId]);

  useEffect(() => {
    if (!activeHintWord) return;
    const timer = setTimeout(() => setActiveHintWord(null), 2000);
    return () => clearTimeout(timer);
  }, [activeHintWord]);

  useEffect(() => {
    if (!activeHintWord) return;
    if (foundSet.has(norm(activeHintWord))) setActiveHintWord(null);
  }, [foundSet, activeHintWord]);

  const isWordSatisfied = useCallback(
    (word: string | null) => {
      if (!word) return false;
      const n = norm(word);
      if (mode === "WORD_SEARCH") return foundSet.has(n);
      return revealedSet.has(n);
    },
    [mode, foundSet, revealedSet]
  );

  useEffect(() => {
    if (requiredFindWord && isWordSatisfied(requiredFindWord)) {
      setRequiredFindWord(null);
    }
  }, [requiredFindWord, isWordSatisfied]);

  const isHintDisabled = useMemo(() => {
    if (hintCount === null) return true;
    const noHintsLeft = hintCount <= 0;
    const mustFindPrev = !!requiredFindWord;

    if (mode === "CROSSWORD_SEARCH") {
      const current = questionsAndAnswers[activeQuestionIndex];
      if (!current) return true;
      const alreadyHinted = hintedAnswers.has(norm(current.answer));
      return noHintsLeft || mustFindPrev || alreadyHinted;
    }

    return noHintsLeft || mustFindPrev;
  }, [
    mode,
    hintCount,
    requiredFindWord,
    questionsAndAnswers,
    activeQuestionIndex,
    hintedAnswers,
  ]);

  const onShowHint = useCallback(async () => {
    if (!userId) return;
    if (!hintCount || hintCount <= 0) return;
    if (requiredFindWord && !isWordSatisfied(requiredFindWord)) return;

    let nextAnswer: string | null = null;

    if (mode === "CROSSWORD_SEARCH") {
      const current = questionsAndAnswers[activeQuestionIndex];
      if (!current) return;

      const ansNorm = norm(current.answer);
      if (hintedAnswers.has(ansNorm)) return;

      nextAnswer = current.answer;

      setHintedAnswers((prev) => {
        const next = new Set(prev);
        next.add(ansNorm);
        return next;
      });
    } else {
      const total = questionsAndAnswers.length;
      for (let offset = 1; offset <= total; offset++) {
        const nextIndex = (lastHintIndex + offset) % total;
        const answer = questionsAndAnswers[nextIndex].answer;
        if (!foundSet.has(norm(answer))) {
          nextAnswer = answer;
          setLastHintIndex(nextIndex);
          setRequiredFindWord(answer);
          break;
        }
      }
    }

    if (!nextAnswer) return;

    setActiveHintWord(nextAnswer);
    showHintForAnswer(nextAnswer);

    try {
      await useHint(Number(userId), gameId);

      const userData = await getUserData(Number(userId));
      setHintCount(userData.hint ?? 0);
    } catch (err) {
      console.error("Failed to update hint", err);
    }
  }, [
    hintCount,
    requiredFindWord,
    isWordSatisfied,
    mode,
    questionsAndAnswers,
    activeQuestionIndex,
    showHintForAnswer,
    lastHintIndex,
    foundSet,
    userId,
    hintedAnswers,
    gameId,
  ]);

  const clearActiveHint = useCallback(() => setActiveHintWord(null), []);

  const resetHints = useCallback(async () => {
    if (!userId) return;
    try {
      const userData = await getUserData(Number(userId));
      setHintCount(userData.hint ?? 0);
    } catch (err) {
      console.error("Failed to reset hint count", err);
      setHintCount(0);
    }
    setLastHintIndex(-1);
    setActiveHintWord(null);
    setRequiredFindWord(null);
    setHintedAnswers(new Set());
  }, [userId]);

  return {
    hintCount,
    isHintDisabled,
    onShowHint,
    clearActiveHint,
    activeHintWord,
    setHintCount,
    resetHints,
    gatedOnWord: requiredFindWord,
  };
}
