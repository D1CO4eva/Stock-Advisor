import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import {
  insertWatchlistSchema,
  insertPortfolioSchema,
  updatePortfolioSchema,
  insertUserSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";
import argon2 from "argon2";
import rateLimit from "express-rate-limit";
import { requireAuth } from "./auth";

// Extend Express Request to include user (for future auth implementation)
interface AuthRequest extends Request {
  user?: User;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const storage = getStorage();

  const stockLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const attachUser = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (req.session?.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  };

  app.use(attachUser);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(parsed.username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashed = await argon2.hash(parsed.password);
      const user = await storage.createUser({
        username: parsed.username,
        password: hashed,
      });
      req.session.userId = user.id;
      return res.json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(parsed.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const match = await argon2.verify(user.password, parsed.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      return res.json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ success: true });
  });

  app.get("/api/auth/me", requireAuth, (req: AuthRequest, res) => {
    res.json({ id: req.user?.id, username: req.user?.username });
  });
  
  // Watchlist routes
  app.get("/api/watchlist", requireAuth, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const watchlist = await storage.getWatchlist(userId);
    res.json(watchlist);
  });

  app.post("/api/watchlist", requireAuth, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
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

  app.delete("/api/watchlist/:symbol", requireAuth, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    await storage.removeFromWatchlist(userId, req.params.symbol);
    res.json({ success: true });
  });

  // Portfolio routes
  app.get("/api/portfolio", requireAuth, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const portfolio = await storage.getPortfolio(userId);
    res.json(portfolio);
  });

  app.post("/api/portfolio", requireAuth, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
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

  app.patch("/api/portfolio/:id", requireAuth, async (req: AuthRequest, res) => {
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

  app.delete("/api/portfolio/:id", requireAuth, async (req: AuthRequest, res) => {
    await storage.removeFromPortfolio(parseInt(req.params.id));
    res.json({ success: true });
  });

  // Stock data proxy with caching
  app.get("/api/stock/:symbol", stockLimiter, async (req, res) => {
    const { symbol } = req.params;
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "FINNHUB_API_KEY not configured" });
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
