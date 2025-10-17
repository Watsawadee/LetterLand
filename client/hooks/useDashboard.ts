import { useQuery } from "@tanstack/react-query";
import { getPeerAverageGamesPerPeriod, getTotalGamePerPeriod, getUserGameStreak, getUserTotalPlaytime, getUserWordLearned } from "@/services/dashboardService";
import { GamesPlayedPerPeriod } from "@/types/gamesPlayedPerPeriod";


const DEFAULT_STALE = 1000 * 60 * 5;
export const useTotalGamesPerPeriod = (
    period: "week" | "month" | "year",
    date: string,
) =>
    useQuery<GamesPlayedPerPeriod>({
        queryKey: ["dashboard", "gamesPerPeriod", period, date],
        queryFn: () => getTotalGamePerPeriod(period, date),
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