import { useQuery } from "@tanstack/react-query";
import { getTotalGameThisWeek, getUserTotalPlaytime, getUserWordLearned } from "@/services/dashboardService";
import { WeeklyGameData } from "@/types/weeklyGamePlayedProps";

export const useTotalGamesThisWeek = () => {
    return (
        useQuery<WeeklyGameData>({
            queryKey: ["games played this week"],
            queryFn: () => getTotalGameThisWeek(),
            staleTime: 1000 * 60 * 5,
            retry: false,
            refetchOnWindowFocus: false,
        })
    )
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