import { useQuery } from "@tanstack/react-query";
import { getPeerAverageGamesPerPeriod, getTotalGameMultiplePeriod, getUserGameStreak, getUserProgress, getUserTotalPlaytime, getUserWordLearned } from "@/services/dashboardService";
import { GamesPlayedMultiplePeriodResponse } from "@/types/gamesPlayedPerPeriod";
import { AverageGamesByLevelPeerMultipleOrError } from "@/libs/type";


const DEFAULT_STALE = 1000 * 60 * 5;
export const useTotalGamesMultiplePeriod = (
    period: "week" | "month" | "year" = "week",
    date?: string
) =>
    useQuery<GamesPlayedMultiplePeriodResponse>({
        queryKey: ["dashboard", "gamesMultiplePeriod", period, date],
        queryFn: () => getTotalGameMultiplePeriod(period, date),
        staleTime: DEFAULT_STALE,
        retry: false,
        refetchOnWindowFocus: false,
    });
export const usePeerAverageGamesPerPeriod = (
    period: "week" | "month" | "year" = "week",
    date?: string
) =>
    useQuery<AverageGamesByLevelPeerMultipleOrError>({
        queryKey: ["dashboard", "peerAverageGamesPerPeriod", period, date],
        queryFn: () => getPeerAverageGamesPerPeriod(period, date),
        staleTime: DEFAULT_STALE,
        retry: false,
        refetchOnWindowFocus: false,
    })
// export function useAverageGamesByLevel(offset: number) {
//     return useQuery({
//         queryKey: ["dashboard", "averageGamesByLevel", offset],
//         queryFn: () => getAverageGamesByLevel(offset),
//         staleTime: 1000 * 60 * 5,
//         retry: false,
//         refetchOnWindowFocus: false,
//     });
// }


//Streak
export function useUserGameStreak() {
    return useQuery({
        queryKey: ["dashboard", "gameStreak"],
        queryFn: getUserGameStreak,
        staleTime: DEFAULT_STALE,
        retry: false,
        refetchOnWindowFocus: false,
    })
}


//User Progress
export function useUserProgress() {
    return useQuery({
        queryKey: ['dashboard', 'userProgress'],
        queryFn: getUserProgress,
        staleTime: DEFAULT_STALE,
        retry: false,
        refetchOnWindowFocus: false,
    });
}



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