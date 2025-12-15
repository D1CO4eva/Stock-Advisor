import { useQuery } from "@tanstack/react-query";
import { fetchStockPrice } from "@/lib/stock-api";
import { STOCKS, Stock } from "@/lib/mock-data";

export function useStockData() {
  return useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const updatedStocks = await Promise.all(
        STOCKS.map(async (stock) => {
          const liveData = await fetchStockPrice(stock.symbol);
          if (liveData) {
            return {
              ...stock,
              price: liveData.c,
              change: liveData.d,
              changePercent: liveData.dp,
              // We keep other fields static as Finnhub free tier doesn't provide all details in one call
              // or requires premium for some fundamental data
            };
          }
          return stock;
        })
      );
      
      return updatedStocks;
    },
    refetchInterval: 30000, // Poll every 30s for live data
  });
}
