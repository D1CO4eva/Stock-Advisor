import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Watchlist,
  InsertWatchlist,
  Portfolio,
  InsertPortfolio,
  UpdatePortfolio,
  ApiCache,
  InsertApiCache,
} from "@shared/schema";

const { Pool } = pg;

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Watchlist operations
  getWatchlist(userId: string): Promise<Watchlist[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: string, symbol: string): Promise<void>;

  // Portfolio operations
  getPortfolio(userId: string): Promise<Portfolio[]>;
  addToPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, updates: UpdatePortfolio): Promise<Portfolio | undefined>;
  removeFromPortfolio(id: number): Promise<void>;

  // API Cache operations
  getCachedStockData(symbol: string): Promise<ApiCache | undefined>;
  setCachedStockData(cache: InsertApiCache): Promise<ApiCache>;
}

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    this.db = drizzle(pool, { schema });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return this.db
      .select()
      .from(schema.watchlists)
      .where(eq(schema.watchlists.userId, userId))
      .orderBy(desc(schema.watchlists.addedAt));
  }

  async addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist> {
    const [result] = await this.db
      .insert(schema.watchlists)
      .values(watchlist)
      .returning();
    return result;
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<void> {
    await this.db
      .delete(schema.watchlists)
      .where(
        and(
          eq(schema.watchlists.userId, userId),
          eq(schema.watchlists.symbol, symbol)
        )
      );
  }

  async getPortfolio(userId: string): Promise<Portfolio[]> {
    return this.db
      .select()
      .from(schema.portfolios)
      .where(eq(schema.portfolios.userId, userId))
      .orderBy(desc(schema.portfolios.addedAt));
  }

  async addToPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [result] = await this.db
      .insert(schema.portfolios)
      .values(portfolio)
      .returning();
    return result;
  }

  async updatePortfolio(id: number, updates: UpdatePortfolio): Promise<Portfolio | undefined> {
    const [result] = await this.db
      .update(schema.portfolios)
      .set(updates)
      .where(eq(schema.portfolios.id, id))
      .returning();
    return result;
  }

  async removeFromPortfolio(id: number): Promise<void> {
    await this.db
      .delete(schema.portfolios)
      .where(eq(schema.portfolios.id, id));
  }

  async getCachedStockData(symbol: string): Promise<ApiCache | undefined> {
    const [cache] = await this.db
      .select()
      .from(schema.apiCache)
      .where(eq(schema.apiCache.symbol, symbol))
      .limit(1);
    
    // Only return if cache is less than 1 minute old
    if (cache) {
      const ageInMinutes = (Date.now() - cache.cachedAt.getTime()) / 1000 / 60;
      if (ageInMinutes < 1) {
        return cache;
      }
    }
    return undefined;
  }

  async setCachedStockData(cache: InsertApiCache): Promise<ApiCache> {
    const [result] = await this.db
      .insert(schema.apiCache)
      .values(cache)
      .onConflictDoUpdate({
        target: schema.apiCache.symbol,
        set: {
          data: cache.data,
          cachedAt: new Date(),
        },
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage(process.env.DATABASE_URL!);
