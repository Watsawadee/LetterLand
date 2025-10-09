import { useQuery } from "@tanstack/react-query";
import { getUserLastFinishedGame } from "@/services/lastFinishedGameService";

export function useUserLastFinishedGame() {
    return useQuery({
        queryKey: ["dashboard", "lastFinishedGame"],
        queryFn: getUserLastFinishedGame,
        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnWindowFocus: false,
    });
}
