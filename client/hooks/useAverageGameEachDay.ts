import { useQuery } from "@tanstack/react-query";
import { getAverageGamesEachDay } from "@/services/dashboardService";

export const useAverageGamesEachDay = (offSet = 0) => {
    return useQuery({
        queryKey: ["averageGamesEachDay", offSet],
        queryFn: () => getAverageGamesEachDay(offSet),
    });
};
