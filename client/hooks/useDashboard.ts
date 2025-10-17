import { useQuery } from "@tanstack/react-query";
import { getPeerAverageGamesPerPeriod, getTotalGamePerPeriod, getUserTotalPlaytime, getUserWordLearned } from "@/services/dashboardService";
import { GamesPlayedPerPeriod } from "@/types/gamesPlayedPerPeriod";


const DEFAULT_STALE = 1000 * 60 * 5;
export const useTotalGamesPerPeriod = (
    period: "week" | "month" | "year",
    date?: string,
    offSet = 0
) =>
    useQuery<GamesPlayedPerPeriod>({
        queryKey: ["dashboard", "gamesPerPeriod", period, date, offSet],
        queryFn: () => getTotalGamePerPeriod(period, date, offSet),
        staleTime: DEFAULT_STALE,
        retry: false,
        refetchOnWindowFocus: false,
    });


export const usePeerAverageGamesPerPeriod = (
    period: "week" | "month" | "year" = "week",
    date?: string
) =>
    useQuery({
        queryKey: ["dashboard", "peerAverageGamesPerPeriod", period, date],
        queryFn: () => getPeerAverageGamesPerPeriod(period, date),
        staleTime: DEFAULT_STALE,
        retry: false,
        refetchOnWindowFocus: false,
    });

// export function useAverageGamesByLevel(offset: number) {
//     return useQuery({
//         queryKey: ["dashboard", "averageGamesByLevel", offset],
//         queryFn: () => getAverageGamesByLevel(offset),
//         staleTime: 1000 * 60 * 5,
//         retry: false,
//         refetchOnWindowFocus: false,
//     });
// }

export function useUserTotalPlaytime() {
    return useQuery({
        queryKey: ['dashboard', 'totalPlaytime'],
        queryFn: getUserTotalPlaytime
    })
}

export function useUserWordLearned() {
    return useQuery({
        queryKey: ['dashboard', 'wordsLearned'],
        queryFn: getUserWordLearned
    })
}