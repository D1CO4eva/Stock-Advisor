CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "watchlists" (
  "id" serial PRIMARY KEY,
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "symbol" text NOT NULL,
  "added_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "portfolios" (
  "id" serial PRIMARY KEY,
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "symbol" text NOT NULL,
  "shares" real NOT NULL,
  "avg_cost" real NOT NULL,
  "added_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_cache" (
  "id" serial PRIMARY KEY,
  "symbol" text NOT NULL UNIQUE,
  "data" jsonb NOT NULL,
  "cached_at" timestamp DEFAULT now() NOT NULL
);
