import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type LoadingState = {
  visible: boolean;
  message?: string;
  progress?: number | null;
  cancellable?: boolean;
};
export type LoadingController = {
  show: (opts?: Partial<Omit<LoadingState, "visible">>) => void;
  update: (opts?: Partial<Omit<LoadingState, "visible">>) => void;
  hide: () => void;
};
type Ctx = LoadingState & LoadingController;

const GlobalLoadingContext = createContext<Ctx | null>(null);

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LoadingState>({
    visible: false,
    message: undefined,
    progress: null,
    cancellable: false,
  });

  // SHOW: turn on + merge provided fields (do NOT blank out others)
  const show = useCallback((opts?: Partial<Omit<LoadingState, "visible">>) => {
    setState((prev) => ({
      visible: true,
      message: opts?.message ?? prev.message,
      progress: opts?.progress ?? prev.progress ?? null,
      cancellable: opts?.cancellable ?? prev.cancellable ?? false,
    }));
  }, []);

  // UPDATE: merge only provided keys
  const update = useCallback(
    (opts?: Partial<Omit<LoadingState, "visible">>) => {
      if (!opts) return;
      setState((prev) => ({
        ...prev,
        ...(opts.message !== undefined ? { message: opts.message } : null),
        ...(opts.progress !== undefined ? { progress: opts.progress } : null),
        ...(opts.cancellable !== undefined
          ? { cancellable: opts.cancellable }
          : null),
      }));
    },
    []
  );

  // HIDE: reset to defaults
  const hide = useCallback(() => {
    setState({
      visible: false,
      message: undefined,
      progress: null,
      cancellable: false,
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, show, update, hide }),
    [state, show, update, hide]
  );

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx)
    throw new Error(
      "useGlobalLoading must be used within GlobalLoadingProvider"
    );
  return ctx;
}
