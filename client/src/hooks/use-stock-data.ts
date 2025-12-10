import { useQuery } from "@tanstack/react-query";
import { fetchStockPrice } from "@/lib/stock-api";
import { STOCKS, Stock } from "@/lib/mock-data";

export function useStockData() {
  const apiKey = localStorage.getItem("finnhub_api_key");

  return useQuery({
    queryKey: ["stocks", apiKey],
    queryFn: async () => {
      if (!apiKey) return STOCKS;

      const updatedStocks = await Promise.all(
        STOCKS.map(async (stock) => {
          const liveData = await fetchStockPrice(stock.symbol, apiKey);
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
    refetchInterval: apiKey ? 30000 : false, // Poll every 30s if using real data
  });
}
