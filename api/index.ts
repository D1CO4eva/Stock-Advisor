import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/app";

let cachedApp: Awaited<ReturnType<typeof createApp>> | null = null;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { app } = await getApp();
  return app(req as any, res as any);
}
