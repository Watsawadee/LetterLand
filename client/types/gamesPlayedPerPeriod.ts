export type GamesPlayedPerPeriod = {
    labels: string[];
    counts: number[];
    period: "week" | "month" | "year";
    range: { start: string; end: string };
    offSet?: number;
    weekLabel?: string;
};