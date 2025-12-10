import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  shares: real("shares").notNull(),
  avgCost: real("avg_cost").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const apiCache = pgTable("api_cache", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  data: jsonb("data").notNull(),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  addedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  addedAt: true,
});

export const updatePortfolioSchema = z.object({
  shares: z.number().optional(),
  avgCost: z.number().optional(),
});

export const insertApiCacheSchema = createInsertSchema(apiCache).omit({
  id: true,
  cachedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlists.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type UpdatePortfolio = z.infer<typeof updatePortfolioSchema>;

export type InsertApiCache = z.infer<typeof insertApiCacheSchema>;
export type ApiCache = typeof apiCache.$inferSelect;
