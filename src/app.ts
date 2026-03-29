import express from "express";


// Create an Express application instance
const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (like form submissions)
// `extended: true` allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// A simple GET route at the root for testing
app.get("/", (req, res) => {
  res.send("API is running");
});

// Export the app instance to be used by server entry point (e.g., index.ts)
export default app;