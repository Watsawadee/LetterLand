import { useEffect, useRef, useState } from "react";

type UseTimeOptions = {
  startTimeSeconds: number;
  paused?: boolean;
  onTimeUp?: () => void;
  resetSignal?: unknown;
};

export function useTime({
  startTimeSeconds,
  paused = false,
  onTimeUp,
  resetSignal,
}: UseTimeOptions) {
  const [secondsLeft, setSecondsLeft] = useState(startTimeSeconds ?? 0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);
  const isEnabled = (startTimeSeconds ?? 0) > 0;

  // Helper to start ticking
  const startInterval = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSecondsLeft(startTimeSeconds ?? 0);
    firedRef.current = false;

    if (!isEnabled) return;

    if (!paused && startTimeSeconds > 0) {
      startInterval();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startTimeSeconds, resetSignal]);

  useEffect(() => {
    if (!isEnabled) return;
    if (paused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (secondsLeft > 0 && !timerRef.current) {
      startInterval();
    }
  }, [paused, isEnabled, secondsLeft]);

  useEffect(() => {
    if (!isEnabled) return;
    if (!paused && secondsLeft === 0 && !firedRef.current) {
      firedRef.current = true;
      onTimeUp?.();
    }
    if (secondsLeft > 0) {
      firedRef.current = false;
    }
  }, [secondsLeft, paused, onTimeUp, isEnabled]);

  const reset = (nextSeconds: number = startTimeSeconds ?? 0) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    firedRef.current = false;
    setSecondsLeft(nextSeconds);
  };

  return { secondsLeft, reset };
}
