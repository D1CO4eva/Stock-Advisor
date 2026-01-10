import type { Portfolio, Watchlist } from "@shared/schema";
import { MOCK_HISTORY_DATA, STOCKS } from "./mock-data";
import {
  addLocalPortfolio,
  addLocalWatchlist,
  getLocalPortfolio,
  getLocalWatchlist,
  removeLocalPortfolio,
  removeLocalWatchlist,
  updateLocalPortfolio,
} from "./local-store";

const API_BASE = "/api";

async function safeFetch<T>(path: string, init: RequestInit | undefined, fallback: () => T | Promise<T>): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch {
    return await fallback();
  }
}

// Portfolio API (with local fallback)
export async function getPortfolio(): Promise<Portfolio[]> {
  return safeFetch("/portfolio", undefined, async () => getLocalPortfolio());
}

export async function addToPortfolio(data: {
  symbol: string;
  shares: number;
  avgCost: number;
}): Promise<Portfolio> {
  return safeFetch(
    "/portfolio",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    async () => addLocalPortfolio(data),
  );
}

export async function updatePortfolio(
  id: number,
  data: { shares?: number; avgCost?: number }
): Promise<Portfolio> {
  return safeFetch(
    `/portfolio/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    async () => {
      const updated = updateLocalPortfolio(id, data);
      if (!updated) throw new Error("Portfolio item not found");
      return updated;
    },
  );
}

export async function removeFromPortfolio(id: number): Promise<void> {
  return safeFetch(
    `/portfolio/${id}`,
    { method: "DELETE" },
    async () => {
      removeLocalPortfolio(id);
    },
  );
}

// Watchlist API (with local fallback)
export async function getWatchlist(): Promise<Watchlist[]> {
  return safeFetch("/watchlist", undefined, async () => getLocalWatchlist());
}

export async function addToWatchlist(symbol: string): Promise<Watchlist> {
  return safeFetch(
    "/watchlist",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    },
    async () => addLocalWatchlist(symbol),
  );
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
  return safeFetch(
    `/watchlist/${symbol}`,
    { method: "DELETE" },
    async () => {
      removeLocalWatchlist(symbol);
    },
  );
}

// Stock data with server-side caching (fallback to mock)
export async function fetchStockDataCached(symbol: string) {
  return safeFetch(
    `/stock/${symbol}`,
    undefined,
    async () => {
      const fallback = STOCKS.find((s) => s.symbol === symbol);
      return fallback
        ? {
            c: fallback.price,
            d: fallback.change,
            dp: fallback.changePercent,
            h: fallback.price + 2,
            l: fallback.price - 2,
            o: fallback.price - 1,
            pc: fallback.price - fallback.change,
          }
        : null;
    },
  );
}

export async function getMarketOverview() {
  return safeFetch(
    "/market/overview",
    undefined,
    async () =>
      STOCKS.slice(0, 15).map((stock) => ({
        symbol: stock.symbol,
        dp: stock.changePercent,
        c: stock.price,
        d: stock.change,
      })),
  );
}

export async function getMarketHistory(symbol: string) {
  return safeFetch(
    `/market/history/${symbol}`,
    undefined,
    async () => {
      const now = Date.now();
      const t = MOCK_HISTORY_DATA.map((_point, idx) =>
        Math.floor((now - (MOCK_HISTORY_DATA.length - 1 - idx) * 24 * 60 * 60 * 1000) / 1000),
      );
      const c = MOCK_HISTORY_DATA.map((point) => point.price);
      return { t, c, s: "ok" };
    },
  );
}

export async function getInsights() {
  return safeFetch("/insights", undefined, async () => {
    const insights = STOCKS.slice(0, 6).map((stock) => {
      const momentum = stock.changePercent;
      return {
        title: `${stock.symbol} insight`,
        sentiment: momentum > 1 ? "Positive" : momentum < -1 ? "Negative" : "Neutral",
        detail:
          momentum > 2
            ? "Bullish momentum with healthy participation."
            : momentum < -2
              ? "Pressure building on the downside; watch support."
              : "Range-bound; waiting for a catalyst.",
        changePercent: momentum,
      };
    });
    return { updatedAt: new Date().toISOString(), insights };
  });
}

export async function getNews(category = "general") {
  const url = `${API_BASE}/news?category=${encodeURIComponent(category)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
  } catch (serverError) {
    // Fallback: fetch directly from Finnhub if user provided a key in localStorage
    try {
      const userKey =
        typeof localStorage !== "undefined" ? localStorage.getItem("finnhub_api_key") : null;
      if (!userKey) throw serverError;
      const direct = await fetch(
        `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${userKey}`,
      );
      if (!direct.ok) throw serverError;
      const data = await direct.json();
      const articles = (data as any[])
        .filter((item) => item.url && item.headline)
        .slice(0, 20)
        .map((item) => ({
          headline: item.headline,
          summary: item.summary,
          source: item.source,
          url: item.url,
          datetime: item.datetime,
          image: item.image,
        }));
      return { category, articles, updatedAt: new Date().toISOString() };
    } catch {
      throw serverError;
    }
  }
}
