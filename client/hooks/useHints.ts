import { useCallback, useMemo, useState, useEffect } from "react";
import { UseHintsArgs } from "../types/type";

function norm(s: string) {
  return s.trim().toUpperCase();
}

export function useHints(args: UseHintsArgs) {
  const {
    mode,
    questionsAndAnswers,
    foundWordsList,
    revealedAnswers,
    activeQuestionIndex,
    showHintForAnswer,
    initialHints = 3,
  } = args;

  const [hintCount, setHintCount] = useState(initialHints);
  const [lastHintIndex, setLastHintIndex] = useState(-1);

  const [activeHintWord, setActiveHintWord] = useState<string | null>(null);

  const [requiredFindWord, setRequiredFindWord] = useState<string | null>(null);

  const foundSet = useMemo(() => new Set(foundWordsList.map(norm)), [foundWordsList]);
  const revealedSet = useMemo(() => new Set(revealedAnswers.map(norm)), [revealedAnswers]);

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
      if (mode === "WORD_SEARCH") {
        return foundSet.has(n);
      }
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
    const noHintsLeft = hintCount <= 0;
    const mustFindPrev = !!requiredFindWord;

    if (mode === "CROSSWORD_SEARCH") {
      const current = questionsAndAnswers[activeQuestionIndex];
      if (!current) return true;
      return noHintsLeft || mustFindPrev;
    }

    return noHintsLeft || mustFindPrev;
  }, [mode, hintCount, requiredFindWord, questionsAndAnswers, activeQuestionIndex]);

  const onShowHint = useCallback(() => {
    if (hintCount <= 0) return;

    if (requiredFindWord) {
      if (isWordSatisfied(requiredFindWord)) {
        setRequiredFindWord(null);
      } else {
        return;
      }
    }

    if (mode === "CROSSWORD_SEARCH") {
      const current = questionsAndAnswers[activeQuestionIndex];
      if (!current) return;

      setActiveHintWord(current.answer);
      showHintForAnswer(current.answer);
      setHintCount((c) => c - 1);
      return;
    }

    const total = questionsAndAnswers.length;
    for (let offset = 1; offset <= total; offset++) {
      const nextIndex = (lastHintIndex + offset) % total;
      const nextAnswer = questionsAndAnswers[nextIndex].answer;

      const isFound = foundSet.has(norm(nextAnswer));
      if (!isFound) {
        setActiveHintWord(nextAnswer);
        setRequiredFindWord(nextAnswer);
        showHintForAnswer(nextAnswer);
        setLastHintIndex(nextIndex);
        setHintCount((c) => c - 1);
        return;
      }
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
  ]);

  const clearActiveHint = useCallback(() => setActiveHintWord(null), []);

  const resetHints = useCallback(
    (n = initialHints) => {
      setHintCount(n);
      setLastHintIndex(-1);
      setActiveHintWord(null);
      setRequiredFindWord(null);
    },
    [initialHints]
  );

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
