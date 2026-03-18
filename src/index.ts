// Load environment variables from .env file
import 'dotenv/config';

import express from "express";
import pipelineRoutes from "./modules/pipelines/pipelines.routes";

// Initialize Express application
const app = express();

console.log("Starting Webhook Pipeline Service...");

// Middleware to parse incoming JSON requests
app.use(express.json());

// Register pipeline-related routes under /api/pipelines
app.use("/api/pipelines", pipelineRoutes);

// Health check / root endpoint
app.get("/", (_req, res) => {
  res.send("Webhook Pipeline Service Running");
});

// Global error handler middleware
// Catches any unhandled errors in the app
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Use PORT from environment or fallback to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});