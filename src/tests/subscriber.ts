import express from 'express';

// Create an Express application
const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());

/**
 * POST /mocker
 * -------------
 * A test endpoint to simulate receiving a webhook.
 * It reads a `job_id` and `payload` from the request body,
 * processes it, and returns a JSON response.
 */
app.post('/mocker', (req, res) => {
  const { job_id, payload } = req.body;

  // Log the entire request body for debugging
  console.log('Test webhook received:', req.body);

  // Initialize result
  let result: string | null = null;

  // Process payload safely: if payload has a 'text' property, convert it to uppercase
  if (payload?.text) {
    result = payload.text.toUpperCase();
  }

  // Send response back to the client
  res.status(200).json({
    success: true,           // Indicates webhook was received successfully
    message: 'Webhook received', // Informative message
    result,                  // Processed payload (uppercase text or null)
  });
});

// Start the server on port 4000
app.listen(4000, () => console.log('Test webhook server running on 4000'));