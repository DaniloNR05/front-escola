import { useQuery } from "@tanstack/react-query";
import { getTournaments } from "@/services/tournaments";

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
  });
}
