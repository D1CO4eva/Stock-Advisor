import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWatchlistSchema, insertPortfolioSchema, updatePortfolioSchema, type User } from "@shared/schema";
import { z } from "zod";

// Extend Express Request to include user (for future auth implementation)
interface AuthRequest extends Request {
  user?: User;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // For now, we'll use a mock user ID. In production, this would come from session/auth
  const getMockUserId = (): string => "demo-user";
  
  // Watchlist routes
  app.get("/api/watchlist", async (req: AuthRequest, res) => {
    const userId = getMockUserId();
    const watchlist = await storage.getWatchlist(userId);
    res.json(watchlist);
  });

  app.post("/api/watchlist", async (req: AuthRequest, res) => {
    const userId = getMockUserId();
    try {
      const data = insertWatchlistSchema.parse({
        ...req.body,
        userId,
      });
      const watchlist = await storage.addToWatchlist(data);
      res.json(watchlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:symbol", async (req: AuthRequest, res) => {
    const userId = getMockUserId();
    await storage.removeFromWatchlist(userId, req.params.symbol);
    res.json({ success: true });
  });

  // Portfolio routes
  app.get("/api/portfolio", async (req: AuthRequest, res) => {
    const userId = getMockUserId();
    const portfolio = await storage.getPortfolio(userId);
    res.json(portfolio);
  });

  app.post("/api/portfolio", async (req: AuthRequest, res) => {
    const userId = getMockUserId();
    try {
      const data = insertPortfolioSchema.parse({
        ...req.body,
        userId,
      });
      const portfolio = await storage.addToPortfolio(data);
      res.json(portfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to portfolio" });
    }
  });

  app.patch("/api/portfolio/:id", async (req: AuthRequest, res) => {
    try {
      const data = updatePortfolioSchema.parse(req.body);
      const portfolio = await storage.updatePortfolio(parseInt(req.params.id), data);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      res.json(portfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  });

  app.delete("/api/portfolio/:id", async (req: AuthRequest, res) => {
    await storage.removeFromPortfolio(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Stock data proxy with caching
  app.get("/api/stock/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const apiKey = req.query.apiKey as string;

    if (!apiKey) {
      return res.status(400).json({ error: "API key required" });
    }

    try {
      // Check cache first
      const cached = await storage.getCachedStockData(symbol);
      if (cached) {
        return res.json(cached.data);
      }

      // Fetch from Finnhub
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }

      const data = await response.json();

      // Cache the result
      await storage.setCachedStockData({
        symbol,
        data: data as any,
      });

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  return httpServer;
}
