import { fetchStockDataCached } from "./api";

export interface StockData {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

export async function fetchStockPrice(symbol: string): Promise<StockData | null> {
  try {
    // Use server-side caching to reduce API calls
    const data = await fetchStockDataCached(symbol);
    return data;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}
