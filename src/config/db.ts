import { Pool } from "pg";

// Ensure the DATABASE_URL environment variable is defined
// This prevents the app from starting with an invalid configuration
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create a PostgreSQL connection pool
// Uses a single connection string for flexibility (local + cloud environments)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the database connection on startup
// Helps detect configuration issues early
pool.connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error", err));