-- Table: pipelines
-- Stores all the pipelines in the system.
-- Each pipeline defines a specific action that can be triggered by a webhook.

CREATE TABLE pipelines (
  id SERIAL PRIMARY KEY,               -- Unique identifier for each pipeline
  name TEXT NOT NULL,                  -- Human-readable name for the pipeline
  action_type TEXT NOT NULL,           -- Type of action this pipeline performs (e.g., 'log', 'uppercase', 'reverse')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the pipeline was created
);
