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
  const [secondsLeft, setSecondsLeft] = useState(startTimeSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const pausedRef = useRef(!!paused);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    pausedRef.current = !!paused;
  }, [paused]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    setSecondsLeft(startTimeSeconds);
    if (!startTimeSeconds || startTimeSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          try {
            onTimeUpRef.current && onTimeUpRef.current();
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimeSeconds, resetSignal]);

  const reset = (nextSeconds: number = startTimeSeconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(nextSeconds);
  };

  return { secondsLeft, reset };
}
