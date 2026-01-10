import type { Portfolio, Watchlist } from "@shared/schema";
import { PORTFOLIO_ITEMS, STOCKS } from "./mock-data";

const STORAGE_KEYS = {
  portfolio: "investai_portfolio",
  watchlist: "investai_watchlist",
};

type StoredPortfolio = Omit<Portfolio, "addedAt"> & { addedAt: string };
type StoredWatchlist = Omit<Watchlist, "addedAt"> & { addedAt: string };

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (e.g., private browsing)
  }
}

function seedPortfolio(): StoredPortfolio[] {
  return PORTFOLIO_ITEMS.map((item, index) => ({
    id: index + 1,
    userId: "local-user",
    symbol: item.symbol,
    shares: item.shares,
    avgCost: item.avgCost,
    addedAt: new Date(Date.now() - index * 86400000).toISOString(),
  }));
}

function seedWatchlist(): StoredWatchlist[] {
  return STOCKS.slice(0, 8).map((stock, index) => ({
    id: index + 1,
    userId: "local-user",
    symbol: stock.symbol,
    addedAt: new Date(Date.now() - index * 7200000).toISOString(),
  }));
}

function normalizePortfolio(data: StoredPortfolio[]): Portfolio[] {
  return data.map((item) => ({
    ...item,
    addedAt: new Date(item.addedAt),
  }));
}

function normalizeWatchlist(data: StoredWatchlist[]): Watchlist[] {
  return data.map((item) => ({
    ...item,
    addedAt: new Date(item.addedAt),
  }));
}

export function getLocalPortfolio(): Portfolio[] {
  const stored = loadFromStorage<StoredPortfolio[]>(STORAGE_KEYS.portfolio, seedPortfolio());
  return normalizePortfolio(stored);
}

export function addLocalPortfolio(data: { symbol: string; shares: number; avgCost: number }): Portfolio {
  const existing = loadFromStorage<StoredPortfolio[]>(STORAGE_KEYS.portfolio, seedPortfolio());
  const nextId = existing.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const created: StoredPortfolio = {
    id: nextId,
    userId: "local-user",
    symbol: data.symbol,
    shares: data.shares,
    avgCost: data.avgCost,
    addedAt: new Date().toISOString(),
  };
  const updated = [created, ...existing];
  saveToStorage(STORAGE_KEYS.portfolio, updated);
  return normalizePortfolio([created])[0];
}

export function updateLocalPortfolio(id: number, updates: { shares?: number; avgCost?: number }): Portfolio | undefined {
  const existing = loadFromStorage<StoredPortfolio[]>(STORAGE_KEYS.portfolio, seedPortfolio());
  const updated = existing.map((item) =>
    item.id === id
      ? { ...item, ...updates }
      : item,
  );
  saveToStorage(STORAGE_KEYS.portfolio, updated);
  return normalizePortfolio(updated).find((item) => item.id === id);
}

export function removeLocalPortfolio(id: number): void {
  const existing = loadFromStorage<StoredPortfolio[]>(STORAGE_KEYS.portfolio, seedPortfolio());
  const updated = existing.filter((item) => item.id !== id);
  saveToStorage(STORAGE_KEYS.portfolio, updated);
}

export function getLocalWatchlist(): Watchlist[] {
  const stored = loadFromStorage<StoredWatchlist[]>(STORAGE_KEYS.watchlist, seedWatchlist());
  return normalizeWatchlist(stored);
}

export function addLocalWatchlist(symbol: string): Watchlist {
  const existing = loadFromStorage<StoredWatchlist[]>(STORAGE_KEYS.watchlist, seedWatchlist());
  if (existing.some((item) => item.symbol === symbol)) {
    return normalizeWatchlist(existing).find((item) => item.symbol === symbol)!;
  }
  const nextId = existing.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const created: StoredWatchlist = {
    id: nextId,
    userId: "local-user",
    symbol,
    addedAt: new Date().toISOString(),
  };
  const updated = [created, ...existing];
  saveToStorage(STORAGE_KEYS.watchlist, updated);
  return normalizeWatchlist([created])[0];
}

export function removeLocalWatchlist(symbol: string): void {
  const existing = loadFromStorage<StoredWatchlist[]>(STORAGE_KEYS.watchlist, seedWatchlist());
  const updated = existing.filter((item) => item.symbol !== symbol);
  saveToStorage(STORAGE_KEYS.watchlist, updated);
}
