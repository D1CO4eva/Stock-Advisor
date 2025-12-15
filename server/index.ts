import dotenv from "dotenv";
// Load .env.local first (for local dev), then fall back to .env if set.
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createApp } from "./app";

(async () => {
  const { httpServer, log } = await createApp();

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5001", 10);
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };

  // reusePort is unsupported on Windows; guard to avoid ENOTSUP locally
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }

  httpServer.listen(listenOptions, () => {
    log(`serving on port ${port}`);
    console.log(`Open http://localhost:${port}`);
  });
})();
