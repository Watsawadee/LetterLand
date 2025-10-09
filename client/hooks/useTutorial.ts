import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Dimensions, ScaledSize } from "react-native";
import type { SpotlightRect } from "@/components/TutorialOverlay";
import type { GameControlsHandle } from "@/components/GameControls";
import type { GameBoardHandle } from "@/components/GameBoard";
import type { CluesPanelHandle } from "@/components/CluesPanel";
import type { SideToolBarHandle } from "@/components/SideToolBar";

export type MeasureFn =
  | (() => Promise<SpotlightRect | null>)
  | (() => SpotlightRect | null)
  | null;

type StepDef = {
  id: string;
  title: string;
  description: string;
  measure: null | (() => Promise<SpotlightRect | null> | SpotlightRect | null);
  rect: SpotlightRect | null;
};

export function useTutorial() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<StepDef[]>([]);
  const dimsRef = useRef(Dimensions.get("window"));

  // --- Cancellation & async tracking ---
  const measureSeqRef = useRef(0);
  const closingRef = useRef(false);
  const pendingMeasure = useRef(false);
  const unmountedRef = useRef(false);

  const timersRef = useRef<number[]>([]);
  const rafsRef = useRef<number[]>([]);

  const registerTimeout = useCallback((fn: () => void, delay = 0) => {
    const id = setTimeout(fn, delay) as unknown as number;
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllAsync = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
    for (const r of rafsRef.current) cancelAnimationFrame(r);
    rafsRef.current = [];
  }, []);

  const schedule = useCallback(
    (fn: () => void, delay = 0) => registerTimeout(fn, delay),
    [registerTimeout]
  );

  const open = useCallback(
    async (defs: Omit<StepDef, "rect">[]) => {
      closingRef.current = false;
      clearAllAsync();

      const token = ++measureSeqRef.current;

      // Pre-measure all incoming steps
      const measured = await Promise.all(
        defs.map(async (d) => {
          try {
            const r =
              typeof d.measure === "function"
                ? await d.measure()
                : d.measure ?? null;
            return { ...d, rect: r ?? null } as StepDef;
          } catch {
            return { ...d, rect: null } as StepDef;
          }
        })
      );

      // If another open/close happened, abort
      if (token !== measureSeqRef.current || closingRef.current) return;

      // Filter out missing spotlight targets
      const filtered = measured.filter((s) => !!s.rect);

      if (unmountedRef.current) return;

      if (filtered.length === 0) {
        setVisible(false);
        setIndex(0);
        setSteps([]);
        return;
      }

      setSteps(filtered);
      setIndex(0);
      setVisible(true);
    },
    [clearAllAsync]
  );

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    measureSeqRef.current++;

    clearAllAsync();

    setVisible(false);
    schedule(() => {
      setIndex(0);
      setSteps([]);
      closingRef.current = false;
    }, 0);
  }, [clearAllAsync, schedule]);

  const go = useCallback(
    (delta: number) => {
      if (closingRef.current || !visible) return;
      setIndex((i) => {
        const next = Math.max(0, Math.min((steps.length || 1) - 1, i + delta));
        return next;
      });
    },
    [steps.length, visible]
  );

  /**
   * if current step becomes invalid, auto-skip to a valid step.
   */
  const _fixIndexAfterUpdate = useCallback(
    (updated: StepDef[], curIndex: number) => {
      if (updated.length === 0) {
        close();
        return;
      }
      if (updated[curIndex]?.rect) {
        // current is still valid
        return;
      }
      // next valid
      let j = curIndex + 1;
      while (j < updated.length && !updated[j].rect) j++;
      if (j < updated.length) {
        setIndex(j);
        return;
      }
      // previous valid
      j = curIndex - 1;
      while (j >= 0 && !updated[j].rect) j--;
      if (j >= 0) {
        setIndex(j);
        return;
      }
      close();
    },
    [close]
  );

  const remeasureAll = useCallback(async () => {
    if (pendingMeasure.current || closingRef.current || !visible) return;
    pendingMeasure.current = true;
    const token = ++measureSeqRef.current;

    try {
      const updated = await Promise.all(
        steps.map(async (s) => {
          if (closingRef.current || token !== measureSeqRef.current) return s;
          const rect =
            (typeof s.measure === "function" ? await s.measure() : s.measure) ??
            null;

          if (closingRef.current || token !== measureSeqRef.current) return s;
          return { ...s, rect };
        })
      );

      if (
        !unmountedRef.current &&
        !closingRef.current &&
        token === measureSeqRef.current
      ) {
        setSteps(updated);
        _fixIndexAfterUpdate(updated, index);
      }
    } finally {
      pendingMeasure.current = false;
    }
  }, [steps, visible, _fixIndexAfterUpdate, index]);

  useEffect(() => {
    if (!visible) return;
    const id = schedule(remeasureAll, 0);
    return () => clearTimeout(id);
  }, [visible, remeasureAll, index, schedule]);

  const goTo = useCallback(
    (id: string) => {
      if (closingRef.current || !visible) return;
      const idx = steps.findIndex((s) => s.id === id);
      if (idx >= 0) setIndex(idx);
    },
    [steps, visible]
  );

  const setStepRect = useCallback((id: string, rect: SpotlightRect | null) => {
    setSteps((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      if (i < 0) return prev;
      const next = prev.slice();
      next[i] = { ...next[i], rect };
      return next;
    });
  }, []);

  const remeasureCurrent = useCallback(async () => {
    if (pendingMeasure.current || closingRef.current || !visible) return;
    const cur = steps[index];
    if (!cur) return;

    pendingMeasure.current = true;
    const token = ++measureSeqRef.current;

    try {
      const rect =
        (typeof cur.measure === "function"
          ? await cur.measure()
          : cur.measure) ?? null;

      if (
        !unmountedRef.current &&
        !closingRef.current &&
        token === measureSeqRef.current
      ) {
        const updated = steps.slice();
        if (!updated[index] || updated[index].id !== cur.id) return;

        updated[index] = { ...updated[index], rect };
        setSteps(updated);

        // if current became invalid, auto-skip
        if (!rect) _fixIndexAfterUpdate(updated, index);
      }
    } finally {
      pendingMeasure.current = false;
    }
  }, [steps, index, visible, _fixIndexAfterUpdate]);

  const isFirst = index <= 0;
  const isLast = steps.length === 0 || index >= steps.length - 1;

  useEffect(() => {
    unmountedRef.current = false;

    let dimTimer: number | null = null;
    const onDimChange = (_: { window: ScaledSize; screen: ScaledSize }) => {
      if (!visible) return;
      if (dimTimer) clearTimeout(dimTimer);
      dimTimer = schedule(() => {
        remeasureAll();
      }, 50);
    };
    const dimSub = Dimensions.addEventListener("change", onDimChange);

    const onAppStateChange = (state: AppStateStatus) => {
      if (!visible) return;
      if (state === "active") schedule(remeasureAll, 0);
    };
    const appSub = AppState.addEventListener("change", onAppStateChange);

    return () => {
      unmountedRef.current = true;
      if (dimTimer) clearTimeout(dimTimer);
      dimSub?.remove?.();
      appSub?.remove?.();
      clearAllAsync();
    };
  }, [visible, remeasureAll, schedule, clearAllAsync]);

  return {
    visible,
    index,
    steps,
    setSteps,
    open,
    close,
    next: () => go(+1),
    prev: () => go(-1),
    remeasureAll,
    isFirst,
    isLast,
    goTo,
    setStepRect,
    remeasureCurrent,
    setIndex,
  };
}

type Mode = "WORD_SEARCH" | "CROSSWORD_SEARCH";

type UseGameTutorialArgs = {
  mode: Mode;
  gameData?: {
    id?: number;
    timer?: number | null;
    gameTemplate?: { gameCode?: string | null; difficulty?: string | null };
  } | null;
  tutorial: ReturnType<typeof useTutorial>;
  controlsRef: React.RefObject<GameControlsHandle | null>;
  boardRef: React.RefObject<GameBoardHandle | null>;
  cluesRef: React.RefObject<CluesPanelHandle | null>;
  sideToolRef: React.RefObject<SideToolBarHandle | null>;
};

type TutorialMeasure = () => Promise<SpotlightRect | null>;
type TutorialStepInput = {
  id: string;
  title: string;
  description: string;
  measure: TutorialMeasure;
};

export function useGameTutorial({
  mode,
  gameData,
  tutorial,
  controlsRef,
  boardRef,
  cluesRef,
  sideToolRef,
}: UseGameTutorialArgs) {
  const openTutorial = useCallback(() => {
    const steps: TutorialStepInput[] = [];
    // GameTitle
    steps.push({
      id: "gametitle",
      title: "Game Title",
      description:
        "The name of the challenge you’re playing now.",
      measure: async () =>
        (await controlsRef.current?.measureGameTitle?.()) ?? null,
    });
    // GameCode
    if (gameData?.gameTemplate?.gameCode) {
      steps.push({
        id: "code",
        title: "Share or note your Game Code",
        description:
          "The unique game code for this game template. Tap to copy and share with friends",
        measure: async () =>
          (await controlsRef.current?.measureGameCode?.()) ?? null,
      });
    }

    // CEFR level
    steps.push({
      id: "cefr",
      title: "Understand Difficulty (CEFR)",
      description:
        "This chip shows the game's CEFR level from A1 (Beginner) to C2 (Advanced). Harder levels mean longer or trickier words!",
      measure: async () => (await controlsRef.current?.measureCefr?.()) ?? null,
    });

    // Timer
    if (gameData?.timer && gameData.timer > 0) {
      steps.push({
        id: "timer",
        title: "Beat the Timer",
        description:
          "Finish the game before time runs out.",
        measure: async () =>
          (await controlsRef.current?.measureTimer?.()) ?? null,
      });
    }

    // Hint button
    steps.push({
      id: "hint",
      title: "Use Hints wisely",
      description:
        "Need help? Use a hint here. If you don’t have hints, you can buy more from the shop.",
      measure: async () =>
        (await controlsRef.current?.measureHintButton?.()) ?? null,
    });

    // Board
    steps.push({
      id: "board",
      title: "Find words on the Board",
      description:
        "Drag across letters (8 directions) to select a word, then release to check. Try to find all answers!",
      measure: async () =>
        (await (boardRef.current as any)?.measureGrid?.()) ?? null,
    });

    // Clues
    steps.push({
      id: "clues",
      title: mode === "CROSSWORD_SEARCH" ? "Clue" : "Word List",
      description:
        mode === "CROSSWORD_SEARCH"
          ? "Use the clue to think of the word, then drag on the grid to select the answer. Tap the left and right arrows to switch between clues."
          : "These are the target words. Found words will highlight automatically.",
      measure: async () => (await cluesRef.current?.measureClues?.()) ?? null,
    });

    // Settings
    steps.push({
      id: "settings",
      title: "Open Game Tools",
      description: "Tap this button to open extra tools like Font Size, Shop, and Tutorial.",
      measure: async () =>
        (await sideToolRef.current?.measureSettingButton?.()) ?? null,
    });

    // Helper to ensure the panel is open before measuring toolbar items
    const ensurePanelAndMeasure = async (
      m?: () => Promise<SpotlightRect | null> | undefined
    ) => {
      sideToolRef.current?.open?.();
      await new Promise((r) => setTimeout(r, 160));
      return (
        (await m?.()) ??
        (await sideToolRef.current?.measureSettingButton?.()) ??
        null
      );
    };

    // Font
    steps.push({
      id: "font",
      title: "Font Settings",
      description:
        "Tap here to customize the text size for your perfect reading comfort.",
      measure: async () =>
        ensurePanelAndMeasure(sideToolRef.current?.measureFont),
    });

    // Shop
    steps.push({
      id: "shop",
      title: "Hint Shop",
      description: "Need more hints? Buy them here using your coins.",
      measure: async () =>
        ensurePanelAndMeasure(sideToolRef.current?.measureShop),
    });

    // Tutorial
    steps.push({
      id: "tutorialButton",
      title: "Replay Tutorial",
      description: "You can replay this step-by-step guide anytime from here.",
      measure: async () =>
        ensurePanelAndMeasure(sideToolRef.current?.measureTutorial),
    });

    tutorial.open(steps);
  }, [
    mode,
    gameData?.gameTemplate?.gameCode,
    gameData?.timer,
    tutorial,
    controlsRef,
    boardRef,
    cluesRef,
    sideToolRef,
  ]);

  return { openTutorial };
}
