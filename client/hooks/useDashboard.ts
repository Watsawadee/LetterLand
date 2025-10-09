import { useQuery } from "@tanstack/react-query";
import { getAverageGamesByLevel, getTotalGameThisWeek, getUserTotalPlaytime, getUserWordLearned } from "@/services/dashboardService";
import { WeeklyGameData } from "@/types/weeklyGamePlayedProps";

export const useTotalGamesThisWeek = (offSet: number) => {
    return (
        useQuery<WeeklyGameData>({
            queryKey: ["games played this week", offSet],
            queryFn: () => getTotalGameThisWeek(offSet),
            staleTime: 1000 * 60 * 5,
            retry: false,
            refetchOnWindowFocus: false,
        })
    )
}
export function useAverageGamesByLevel(offset: number) {
    return useQuery({
        queryKey: ["dashboard", "averageGamesByLevel", offset],
        queryFn: () => getAverageGamesByLevel(offset),
        staleTime: 1000 * 60 * 5,
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