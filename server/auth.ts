import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, Request, Response, NextFunction } from "express";
import { getStorage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function setupSession(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET;
  const connectionString = process.env.DATABASE_URL;

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET is required to start the server");
  }

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to start the server");
  }

  const PgStore = connectPgSimple(session);
  const store = new PgStore({
    conString: connectionString,
    createTableIfMissing: true,
  });

  app.use(
    session({
      store,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const storage = getStorage();
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = user;
  next();
}
