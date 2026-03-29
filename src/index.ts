// Load environment variables from .env file
import "dotenv/config";

// Import the main Express app instance
import app from "./app";
import { errorHandler } from './utils/errorHandler';

// Import route modules for different features of the application
import pipelineRoutes from './modules/pipelines/routes/pipeline.route';
import subscriberRoutes from './modules/subscribers/routes/subscriber.route';
import subscriptionRoutes from './modules/subscriptions/routes/subscription.route';
import jobRoutes from './modules/jobs/routes/job.route';
import deliveryRoutes from './modules/deliveries/routes/delivery.route';
import webhookRoutes from './modules/webhooks/routes/webhook.route';

// Mount the webhook routes under '/webhooks' endpoint
app.use('/webhooks', webhookRoutes);

// Set the port from environment variable, default to 3000 if not provided
const PORT = process.env.PORT || 3000;

// Mount the other routes for different modules
app.use('/pipelines', pipelineRoutes);       // Handles all pipeline-related requests
app.use('/subscribers', subscriberRoutes);   // Handles subscriber-related requests
app.use('/subscriptions', subscriptionRoutes); // Handles subscription-related requests (note the typo in folder name)
app.use('/jobs', jobRoutes);                 // Handles job-related requests
app.use('/deliveries', deliveryRoutes);     // Handles delivery-related requests

app.use(errorHandler);

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});