import express from "express";
// Custom error-handling middleware
import { errorHandler } from './middlewares/error.middleware';

// Create an Express application instance
const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (like form submissions)
// `extended: true` allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// **Note:** You have `app.use(express.json());` again here — this is redundant
// You can remove the second call, it’s already included above
// app.use(express.json());

// Global error-handling middleware
// This should generally be placed after all route definitions to catch errors
app.use(errorHandler);

// A simple GET route at the root for testing
app.get("/", (req, res) => {
  res.send("API is running");
});

// Export the app instance to be used by server entry point (e.g., index.ts)
export default app;