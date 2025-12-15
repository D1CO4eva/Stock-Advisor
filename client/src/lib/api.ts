import type { Portfolio, Watchlist } from "@shared/schema";

const API_BASE = "/api";

// Portfolio API
export async function getPortfolio(): Promise<Portfolio[]> {
  const res = await fetch(`${API_BASE}/portfolio`);
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function addToPortfolio(data: {
  symbol: string;
  shares: number;
  avgCost: number;
}): Promise<Portfolio> {
  const res = await fetch(`${API_BASE}/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add to portfolio");
  return res.json();
}

export async function updatePortfolio(
  id: number,
  data: { shares?: number; avgCost?: number }
): Promise<Portfolio> {
  const res = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update portfolio");
  return res.json();
}

export async function removeFromPortfolio(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove from portfolio");
}

// Watchlist API
export async function getWatchlist(): Promise<Watchlist[]> {
  const res = await fetch(`${API_BASE}/watchlist`);
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}

export async function addToWatchlist(symbol: string): Promise<Watchlist> {
  const res = await fetch(`${API_BASE}/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol }),
  });
  if (!res.ok) throw new Error("Failed to add to watchlist");
  return res.json();
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
  const res = await fetch(`${API_BASE}/watchlist/${symbol}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove from watchlist");
}

// Stock data with server-side caching
export async function fetchStockDataCached(symbol: string) {
  const res = await fetch(`${API_BASE}/stock/${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch stock data");
  return res.json();
}

export async function getMarketOverview() {
  const res = await fetch(`${API_BASE}/market/overview`);
  if (!res.ok) throw new Error("Failed to fetch market overview");
  return res.json();
}

export async function getMarketHistory(symbol: string) {
  const res = await fetch(`${API_BASE}/market/history/${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch market history");
  return res.json();
}

export async function getInsights() {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error("Failed to fetch insights");
  return res.json();
}

export async function getNews(category = "general") {
  const res = await fetch(`${API_BASE}/news?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}
