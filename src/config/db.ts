import { Pool } from 'pg';
import 'dotenv/config';

/**
 * PostgreSQL connection pool
 * ---------------------------
 * Uses DATABASE_URL from environment variables to connect to the database.
 * Pool allows multiple queries to run concurrently and efficiently.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Connection string from .env
});

/**
 * Optional connection test (development only)
 * --------------------------------------------
 * Checks if the pool can successfully connect to the database
 * Logs connection status for debugging.
 */
if (process.env.NODE_ENV !== 'production') {
  pool
    .connect()
    .then(client => {
      console.log('Connected to PostgreSQL database'); // Success message
      client.release(); // Release the client back to the pool
    })
    .catch(err => console.error('PostgreSQL connection error:', err)); // Log errors
}