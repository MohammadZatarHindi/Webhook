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
  const { job_id, processed_payload } = req.body; // <-- use processed_payload

  console.log('Test webhook received:', req.body);

  // Echo back the processed_payload
  res.status(200).json({
    success: true,
    message: 'Webhook received',
    result: processed_payload || null, // now will show { text: "HELLO, WORLD!" }
  });
});

// Start the server on port 4000
app.listen(4000, () => console.log('Test webhook server running on 4000'));