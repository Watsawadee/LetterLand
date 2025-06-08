import { useQuery } from "@tanstack/react-query";
import { getUserCEFR } from "@/services/getUserCEFR";

export const useUserCEFR = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["cefr", userId],
    queryFn: () => getUserCEFR(userId!),
    enabled: !!userId,
  });
};
