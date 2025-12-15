import { useQuery } from "@tanstack/react-query";
import { getMarketOverview, getMarketHistory } from "@/lib/api";

export function useMarketOverview() {
  return useQuery({
    queryKey: ["market", "overview"],
    queryFn: getMarketOverview,
    refetchInterval: 30000,
  });
}

export function useMarketHistory(symbol: string) {
  return useQuery({
    queryKey: ["market", "history", symbol],
    queryFn: () => getMarketHistory(symbol),
    staleTime: 1000 * 60 * 30,
  });
}
