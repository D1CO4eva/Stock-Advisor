import { LucideIcon, TrendingUp, TrendingDown, Activity, DollarSign, PieChart, BarChart3 } from "lucide-react";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  volume: string;
  peRatio: number;
  sector: string;
  recommendation: "Buy" | "Sell" | "Hold";
  score: number; // 0-100 AI Confidence Score
  technicalSignal: "Bullish" | "Bearish" | "Neutral";
  fundamentalSignal: "Strong" | "Weak" | "Neutral";
  description: string;
}

export const STOCKS: Stock[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 181.92,
    change: -1.88,
    changePercent: -0.74,
    marketCap: "4.5T",
    volume: "45.2M",
    peRatio: 72.4,
    sector: "Technology",
    recommendation: "Buy",
    score: 94,
    technicalSignal: "Bullish",
    fundamentalSignal: "Strong",
    description: "NVIDIA is the leading manufacturer of graphics processing units (GPUs) and AI hardware.",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    price: 215.98,
    change: 1.58,
    changePercent: 0.74,
    marketCap: "350B",
    volume: "62.1M",
    peRatio: 345.1,
    sector: "Technology",
    recommendation: "Hold",
    score: 65,
    technicalSignal: "Neutral",
    fundamentalSignal: "Strong",
    description: "AMD develops computer processors and related technologies for business and consumer markets.",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 477.73,
    change: -12.27,
    changePercent: -2.50,
    marketCap: "3.5T",
    volume: "22.5M",
    peRatio: 36.8,
    sector: "Technology",
    recommendation: "Buy",
    score: 88,
    technicalSignal: "Bullish",
    fundamentalSignal: "Strong",
    description: "Microsoft is a global technology leader known for Windows, Office, and Azure cloud services.",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 446.74,
    change: 17.50,
    changePercent: 4.08,
    marketCap: "1.4T",
    volume: "98.4M",
    peRatio: 40.2,
    sector: "Consumer Cyclical",
    recommendation: "Sell",
    score: 32,
    technicalSignal: "Bearish",
    fundamentalSignal: "Weak",
    description: "Tesla designs and manufactures electric vehicles, battery energy storage, and solar products.",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 316.12,
    change: 3.58,
    changePercent: 1.15,
    marketCap: "858B",
    volume: "8.9M",
    peRatio: 15.6,
    sector: "Financial Services",
    recommendation: "Buy",
    score: 82,
    technicalSignal: "Bullish",
    fundamentalSignal: "Strong",
    description: "JPMorgan Chase is one of the largest financial services firms in the world.",
  },
];

export const MOCK_HISTORY_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: 180 + Math.random() * 50 - 25 + (i * 2), // Upward trend simulation
    volume: Math.floor(Math.random() * 10000) + 5000,
  };
});

export const PORTFOLIO_ITEMS = [
  { symbol: "NVDA", shares: 10, avgCost: 120.00, currentPrice: 181.92, totalValue: 1819.20, return: 619.20, returnPercent: 51.6 },
  { symbol: "MSFT", shares: 25, avgCost: 380.00, currentPrice: 477.73, totalValue: 11943.25, return: 2443.25, returnPercent: 25.7 },
  { symbol: "TSLA", shares: 50, avgCost: 210.00, currentPrice: 446.74, totalValue: 22337.00, return: 11837.00, returnPercent: 112.7 },
];
