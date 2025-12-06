import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local file from project root
config({ path: ".env.local" });


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
