import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

// Lightweight .env.local loader (no extra dependency)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvLocal() {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    if (!fs.existsSync(envPath)) {
      return;
    }

    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const [key, ...rest] = trimmed.split("=");
      if (!key) continue;
      const rawValue = rest.join("=").trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Fail silently; app will still error with a clear DATABASE_URL message below
  }
}

loadEnvLocal();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
  if (isProduction) {
    throw new Error(
      "DATABASE_URL must be set in production. Please configure it in your Vercel environment variables.",
    );
  } else {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database? Check your .env.local file.",
    );
  }
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add connection timeout and error handling for production
  connectionTimeoutMillis: 10000, // 10 seconds
  query_timeout: 10000,
  statement_timeout: 10000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
