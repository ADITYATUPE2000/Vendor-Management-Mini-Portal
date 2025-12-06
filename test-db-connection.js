import { config } from "dotenv";
import pg from "pg";

// Load .env.local
config({ path: ".env.local" });

const { Pool } = pg;

console.log("Testing database connection...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Found" : "NOT FOUND");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

// Extract parts for display (without showing full password)
const url = process.env.DATABASE_URL;
const match = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (match) {
  console.log("Username:", match[1]);
  console.log("Password:", match[2].substring(0, 5) + "..." + (match[2].includes("%40") ? " (URL-encoded)" : ""));
  console.log("Host:", match[3]);
  console.log("Port:", match[4]);
  console.log("Database:", match[5]);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const result = await pool.query("SELECT NOW()");
  console.log("✅ Connection successful!");
  console.log("Server time:", result.rows[0].now);
  await pool.end();
} catch (error) {
  console.error("❌ Connection failed:");
  console.error("Error code:", error.code);
  console.error("Error message:", error.message);
  if (error.code === "28P01") {
    console.error("\n💡 Password authentication failed. Please verify:");
    console.error("   1. The PostgreSQL user exists");
    console.error("   2. The password is correct");
    console.error("   3. The password '@' is encoded as '%40' in the URL");
  }
  await pool.end();
  process.exit(1);
}

