import { useQuery } from "@tanstack/react-query";
import { getUserCEFR } from "@/services/getUserCEFR";

export const useUserCEFR = (userId: string | undefined) => {
  return useQuery<{ englishLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" }>({
    queryKey: ["cefr", userId],
    queryFn: () => getUserCEFR(userId!),
    enabled: !!userId,
  });
};
