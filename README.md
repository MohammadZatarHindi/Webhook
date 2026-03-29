![CI Status](https://github.com/MohammadZatarHindi/Webhook/actions/workflows/ci.yml/badge.svg)

# Express-Powered Webhook Orchestrator

A high-performance **Node.js** middleware service designed for asynchronous data transformation and delivery. Built with **Express.js**, **PostgreSQL** & **Docker**, 
this system implements a Producer-Consumer architecture—using a dedicated background worker to decouple incoming webhook ingestion from heavy processing and delivery tasks.

---

## Core Features

### Extensible Processing Pipelines
Create and manage data streams with modular transformation logic. Each pipeline is mapped to a specific action type, ensuring strict data handling:

**1. Transformation Suite:** Supports `log` (observability), `uppercase` (string manipulation), and `reverse` (data inversion).

**2. Isolated Processing:** Each pipeline operates independently, allowing unique configurations for different data sources.

---

### Dynamic Subscriber Egress
Manage where your processed data goes without hardcoding endpoints.

**1. One-to-Many Fan-out:** Attach multiple subscriber URLs to a single pipeline. A single incoming event can trigger multiple downstream deliveries.

**2. Dynamic Registration:** Add or remove subscribers via the API at runtime without restarting the Node.js services.

---

### Granular Subscribtion Management
The system uses a relational mapping to connect data sources to their destinations.

**1. Many-to-Many Architecture:** A single pipeline can broadcast to multiple subscribers, and a subscriber can be associated with multiple pipelines through the subscribtions layer.

**2. Target Isolation:** Subscribtions are managed as independent entities, allowing you to activate or deactivate specific delivery routes without deleting the underlying pipeline or subscriber data.

---

### Persistent Job Queue (Event-Driven)
Utilizes a **PostgreSQL-backed queue** to ensure that no data is lost during spikes in traffic.

**1. State Machine:** Every job follows a strict lifecycle: - `pending` → `processing` → `success` / `failed`.

**2. Asynchronous Execution:** By offloading work to the jobs table, the Express API remains non-blocking and highly responsive.

---

### High-Efficiency Background Worker
A dedicated **Node.js process** that acts as the engine of the system:

**1. Optimized Polling:** A configurable `5`-second heartbeat ensures rapid task pickup while maintaining low CPU overhead.

**2. Pipeline Execution:** Automatically applies the correct transformation (action) before attempting delivery to the subscriber list.

**3. Graceful Termination:** Handles SIGTERM and SIGINT signals to ensure that the PostgreSQL pool is closed and the current worker heartbeat completes before the process exits, 
preventing data corruption or leaked connections.

---

### Fault-Tolerant Retry Engine
Built-in resilience for unstable network conditions or failing downstream services:

**1. Multi-Level Retries:** Both the core job processing and individual subscriber deliveries feature a `3`-attempt limit.

**2. Deep Observability:** Detailed error tracking and timestamps for every failed attempt are stored in the database for easy debugging.

---

### Persistent Job Queue with BullMQ

This system leverages **BullMQ** to handle asynchronous job processing efficiently:

- **Queue-Based Architecture:** The API enqueues jobs into BullMQ backed by Redis. The worker consumes jobs in a non-blocking, fault-tolerant manner.
- **Retry Logic:** Each job can retry failed subscriber deliveries up to 3 times automatically.
- **Multi-Subscriber Fan-Out:** Jobs can notify multiple subscribers simultaneously, ensuring reliable delivery of processed payloads.
- **Job Lifecycle:** Jobs follow a strict state machine: `pending` → `processing` → `success` / `failed`.
- **Monitoring & Observability:** Each job and delivery attempt is logged in the database, providing a full audit trail of processed events.

### Database Architecture

**1. Configuration Layer:**
- **pipelines:** The core definition of a data stream. It stores the action_type (e.g., log, uppercase, reverse) which determines how the Worker transforms the data.

- **subscribers:** A registry of external webhook endpoints (URLs) that are eligible to receive processed data.

- **subscribtions:** A join table that manages the Many-to-Many relationship between pipelines and subscribers. This allows one pipeline to "fan-out" data to multiple destinations.

**2. Execution & Queue Layer:**
- **events (The Job Queue):** Acts as the persistent storage for the asynchronous pipeline. It stores the raw payload, current status (pending, processing, success, failed), and an attempts counter for the retry logic.

- **deliveries (Audit Trail):** A granular log of every HTTP request made by the Worker. It records the HTTP Status Code and any response errors, ensuring full observability for debugging failed delivery attempts.

---

### Database Strategy & Schema Control
The system's data integrity is managed through a centralized Source of Truth located in `src/db/schema.sql`.

**1. Idempotent Migrations:** The schema is designed to be easily reproducible. It includes IF NOT EXISTS logic and standard PostgreSQL constraints (Foreign Keys, Defaults, and Timestamps) to ensure a consistent environment across WSL, Docker, or Production.

**2. Relational Integrity:** By enforcing ON DELETE CASCADE and strict data types in the SQL layer, the database maintains its own health, reducing the burden on the Node.js application layer.

**3. Audit Readiness:** The schema explicitly separates "Configuration" (Pipelines/Subscribers) from "Execution" (Events/Deliveries), allowing for high-performance indexing and historical audit trails.

---

### Technical Foundation: Clean Code & Robustness
To ensure the system is production-ready, I implemented a unified architectural layer that handles validation, error management, and database interaction:

**1. Type-Safe Validation & Error Handling:** The system uses Zod for strict schema validation at the middleware level. To keep the controllers clean and DRY (Don't Repeat Yourself), 
I developed a catchAsync wrapper. This higher-order function eliminates the need for repetitive try/catch blocks in every controller; it automatically catches asynchronous errors and forwards them to a centralized Global Error Middleware and a custom AppError class.

**2. Generic Data Access Layer:** To optimize database interactions and reduce boilerplate, I built a genericQueries.ts utility. 
This layer abstracts common PostgreSQL CRUD operations, providing a consistent interface for all modules (Pipelines, Jobs, Subscribers). This, 
combined with a centralized dbErrorHandler, ensures that database-level exceptions (like unique constraint violations) are gracefully transformed into meaningful API responses.

**3. Type-Safe Environment Config:** The application validates .env variables at startup using Zod, 
ensuring the server never starts with missing or malformed configuration (like an invalid DATABASE_URL).

---

## Project Structure

The project follows a **Modular Architecture**. Each domain (Pipelines, Subscribers, Jobs, etc...) is a self-contained unit with a consistent internal structure:

```text
src/
├── modules/               # Domain-Driven Design (DDD)
│   ├── [module_name]/     # Standardized Module Template:
│   │   ├── controllers/   # Request/Response handling (via catchAsync)
│   │   ├── services/      # Business logic & Generic Query integration
│   │   ├── routes/        # Express Route definitions
│   │   ├── types/         # TypeScript Interfaces & Enums
│   │   └── validation/    # Zod Schemas for request parsing
│   ├── pipelines/
│   ├── jobs/
│   ├── deliveries/
│   ├── subscribers/
│   └── webhooks/
├── config/                # db.ts & genericQueries.ts (The DAL)
├── db/                    # SQL schema
├── middlewares/           # Global Error & Validation logic
├── utils/                 # catchAsync, AppError, & Response helpers
├── worker/                # Asynchronous Job Consumer (5s Polling)
├── app.ts                 # Express Configuration
└── index.ts               # Server Entry Point
package.json
tsconfig.json
```

---

## Database Migrations
This project uses a programmatic migration tool to manage schema changes. This ensures that the database structure is version-controlled alongside the code.


**1. Run Migrations (Bring DB to latest state):**

```bash
npx migration up
```

**2. Rollback (If needed):**

```bash
npx migration down
```

---

## Database Initialization
Before running the application, you must create the PostgreSQL database and apply the schema:

```bash
# 1. Access PostgreSQL
sudo -u postgres psql

# 2. Create the database
CREATE DATABASE webhook_remake_db;
\q

# 3. Apply the Schema (Tables, Constraints, and Indexes)
psql -d webhook_remake_db -f src/db/schema.sql
```

---

## Docker Orchestration
This project is fully containerized using a Single-Image, Multi-Role strategy. Both the API and the Background Worker share the same build environment 
but execute different entry points.

**1. One-Click Deployment**
To launch the entire ecosystem (API, Background Worker, and PostgreSQL Database) with a single command:
```bash
docker-compose up --build
```

**2. Service Architecture**
The docker-compose.yml file orchestrates three distinct services:

|    Service    |     Role      |    Command    |     Port      |
| ------------- | ------------- | ------------- | ------------- |
|      db       | PostgreSQL Persistence  | postgres:15-alpine  | 5432  |
|      api      | Express Ingestion (Producer)  | npm run dev  | 3000  |
|     worker    | Task Consumer  | npx ts-node src/worker/worker.ts  | N/A  |


3. **Managing Individual Containers**
If you need to restart or view logs for a specific part of the system:

View Worker Logs:

```bash
docker-compose logs -f worker
```

Run Only the Worker:

```bash
docker-compose up worker
```

Stop All Services:

```bash
docker-compose down
```


---

## Setup Instructions

1. Clone the repo

```text
git clone https://github.com/MohammadZatarHindi/webhook
cd webhook-pipeline
```

2. Install dependencies

```text
npm install
```

3. Create .env file based on `.env.example`

4. Setup PostgreSQL database

```text
psql -d webhook_remake_db -f src/db/schema.sql
```

5. Run the server

```text
npm run dev
```

API will be available at http://localhost:3000

--- 

## POST Body Example:

```text
{
	"pipeline_name": "Log",
	"action_type": "log"
}
```

---

## Quick Start Example

**1. Create Pipeline**

```bash
curl -X POST http://localhost:3000/pipelines \
  -H "Content-Type: application/json" \
  -d '{"name": "Uppercase", "action_type": "uppercase"}'
```

**2. Create Subscriber**

```bash
curl -X POST http://localhost:3000/subscribers \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:4000/mocker"}'
```

**3. Create Subscribtons**

```bash
curl -X POST http://localhost:3000/subscribtions \
  -H "Content-Type: application/json" \
  -d '{"pipeline_id": 1, "subscriber_id": 1}'
```

**4. Queue a job**

```bash
curl -X POST http://localhost:3000/webhooks/1 \
  -H "Content-Type: application/json" \
  -d '{"payload": {"text": "Hello, world!"}}'
```

**5. Start the worker**

```bash
npm run worker
```
  