import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js"; // ADD THIS - import your database pool

const SALT_ROUNDS = 10;

// Lightweight .env.local loader (same as in db.js)
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
      const trimmedKey = key.trim();
      const rawValue = rest.join("=").trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (!(trimmedKey in process.env)) {
        process.env[trimmedKey] = value;
      }
    }
  } catch {
    // Fail silently; app will still error with a clear SESSION_SECRET message below
  }
}

loadEnvLocal();

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Ensure SESSION_SECRET is set
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production");
    }
    // Use a default secret for development (not secure, but allows the app to run)
    console.warn("WARNING: SESSION_SECRET not set. Using default secret for development. Set SESSION_SECRET in production!");
  }
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool: pool, // CHANGED: Use pool instead of conString
    createTableIfMissing: false,
    ttl: sessionTtl / 1000, // CHANGED: ttl expects seconds, not milliseconds
    tableName: "sessions",
  });
  
  return session({
    secret: sessionSecret || "dev-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export function isAuthenticated(req, res, next) {
  if (req.session && req.session.vendorId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function setupAuth(app) {
  app.set("trust proxy", 1);
  app.use(getSession());
}