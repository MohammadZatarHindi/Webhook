-- ===============================
-- Enum types
-- -------------------------------
-- Define reusable enumerated types for actions and status fields
-- ===============================
CREATE TYPE action_type_enum AS ENUM ('log', 'uppercase', 'reverse');
CREATE TYPE job_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE delivery_status_enum AS ENUM ('pending', 'success', 'failed');

-- ==================================================
-- Table: pipelines
-- -----------------
-- Stores unique processing rules for incoming webhooks
-- Each pipeline defines a type of action to perform
-- ==================================================
CREATE TABLE pipelines (
    pipeline_id SERIAL PRIMARY KEY,           -- Auto-increment unique ID
    pipeline_name TEXT NOT NULL UNIQUE,       -- Name of the pipeline (must be unique)
    action_type action_type_enum NOT NULL,    -- Type of action this pipeline performs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Optional: track last update
);

-- ============================
-- Table: subscribers
-- ----------------------------
-- Stores unique destination endpoints for webhook delivery
-- ============================
CREATE TABLE subscribers (
    subscriber_id SERIAL PRIMARY KEY,         -- Auto-increment unique ID
    url TEXT NOT NULL,                        -- Endpoint URL for delivery
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: subscriptions (Many-to-Many link)
-- -----------------
-- Links subscribers to pipelines
-- Ensures a subscriber can subscribe to multiple pipelines and vice versa
-- ============================================
CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,       -- Unique ID for this subscription link
    subscriber_id INT NOT NULL REFERENCES subscribers(subscriber_id) ON DELETE CASCADE, -- FK
    pipeline_id INT NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE CASCADE,      -- FK
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscriber_id, pipeline_id)       -- Prevent duplicate subscriptions
);

-- ===============================
-- Table: jobs
-- -----------------
-- Represents a single webhook event to be processed
-- One row per incoming request
-- ===============================
CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,                -- Unique job ID
    pipeline_id INT NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE CASCADE, -- Associated pipeline
    payload JSONB NOT NULL,                   -- Raw payload received
    status job_status_enum NOT NULL DEFAULT 'pending', -- Current processing status
    attempts INT NOT NULL DEFAULT 0,          -- Number of processing attempts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Table: deliveries
-- -----------------
-- Tracks delivery attempts of jobs to individual subscribers
-- Enables granular retry and status tracking per subscriber
-- ===============================
CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,           -- Unique delivery ID
    job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,           -- Job being delivered
    subscriber_id INT NOT NULL REFERENCES subscribers(subscriber_id) ON DELETE CASCADE, -- Destination
    status delivery_status_enum NOT NULL DEFAULT 'pending', -- Delivery status
    attempts INT NOT NULL DEFAULT 0,          -- Number of delivery attempts for this subscriber
    response_code INT,                        -- HTTP response code from subscriber
    response_body TEXT,                       -- Response body from subscriber
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last delivery attempt time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Indexes for performance
-- ----------------------------
-- Optimizes lookups for subscriptions, jobs, and deliveries
-- ===============================

-- Index for fast lookups of subscriptions by pipeline
CREATE INDEX idx_subscriptions_pipeline_id ON subscriptions(pipeline_id);

-- Index for fast lookup of jobs by pipeline
CREATE INDEX idx_jobs_pipeline_id ON jobs(pipeline_id);

-- Index for deliveries by job
CREATE INDEX idx_deliveries_job_id ON deliveries(job_id);

-- Index for deliveries by subscriber
CREATE INDEX idx_deliveries_subscriber_id ON deliveries(subscriber_id);

-- Index for quick filtering by delivery status
CREATE INDEX idx_deliveries_status ON deliveries(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update updated_at if the column exists
  IF TG_TABLE_NAME IN ('pipelines', 'subscribers', 'subscriptions', 'jobs', 'deliveries') THEN
    BEGIN
      NEW.updated_at = NOW();
    EXCEPTION WHEN undefined_column THEN
      -- Do nothing if updated_at doesn't exist
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jobs
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_pipelines
BEFORE UPDATE ON pipelines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_subscribers
BEFORE UPDATE ON subscribers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();