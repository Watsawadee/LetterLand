export type GamesPlayedSinglePeriod = {
    labels: string[];
    counts: number[];
    period: "week" | "month" | "year";
    range: { start: string; end: string };
    date: string;                // ← added from backend
    offSet?: number;             // optional if you still use offset logic
    weekLabel?: string;          // optional, for display label in frontend
};

// Full response (for swipeable charts)
export type GamesPlayedMultiplePeriodResponse = {
    results: GamesPlayedSinglePeriod[];  // array of 5 periods
    currentIndex?: number;               // index for current (latest) period
};
