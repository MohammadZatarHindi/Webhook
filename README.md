# Webhook Pipeline Service

A **Pipeline Service** built with **TypeScript**, **Express**, and **PostgreSQL**, with input validation via **Zod**.  
This project allows creating and managing pipelines with predefined actions, and receiving webhooks.

---

## Features

### Pipelines
- Create pipelines with predefined actions:
  - `log`
  - `uppercase`
  - `reverse`
- Each pipeline processes incoming data differently

---

### Subscribers
- Attach multiple subscriber URLs to a pipeline
- Each processed job is delivered to all subscribers
- Dynamic (not hardcoded)

---

### Jobs / Events (Queue System)
- Jobs are stored in the `events` table
- Processed asynchronously by a worker
- Status lifecycle:
  - `pending` → `processing` → `success` / `failed`

---

### Retry Mechanism
- Job retry (max 3 attempts)
- Subscriber retry (max 3 attempts per subscriber)
- Error tracking and logging

---

### Worker System
- Background worker processes jobs every 2 seconds
- Applies pipeline actions
- Sends results to subscribers

---

### Database Design

#### Pipelines
- Stores pipeline definitions

#### Subscribers
- Stores webhook endpoints per pipeline

#### Events (Jobs)
- Stores queued jobs and execution state

---

## Project Structure

```text
src/
├── config/
│   └── db.ts          # PostgreSQL connection
├── db/
│   └── schema.sql     # Pipelines & Webhooks tables
├── modules/
│   ├── pipelines/
│   │   ├── pipelines.controller.ts
│   │   ├── pipelines.routes.ts
│   │   ├── pipelines.service.ts
│   │   ├── pipelines.types.ts
│   │   └── pipelines.schema.ts
│   ├── webhooks/
│   │    ├── webhooks.controller.ts
│   │    ├── webhooks.routes.ts
│   │    ├── webhooks.service.ts
│   │    ├── webhooks.types.ts
│   │    └── webhooks.schema.ts
│	├── subscribers
│	│	 ├── subscribers.controller.ts
│	│	 ├── subscribers.routes.ts
│	│	 ├── subscribers.schema.ts
│	│    ├── subscribers.service.ts
│	│	 └── subscribers.types.ts
│	├── jobs
│	 	 ├── jobs.controller.ts
│	 	 ├── jobs.routes.ts
│	 	 ├── jobs.service.ts
│	 	 └── jobs.types.ts
├── index.ts           # Entry point
package.json
tsconfig.json
```
---

## Environment Variables

Create a .env file in the root folde

```text
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/webhook_db
```

--- 

## Setup Instructions

1. Clone the repo

```text
git clone https://https://github.com/MohammadZatarHindi/webhook
cd webhook-pipeline
```

2. Install dependencies

```text
npm install
```

3. Create .env file based on `.env.example`

4. Setup PostgreSQL database

```text
psql -d webhook_db -f src/db/schema.sql
```

5. Run the server

npm run dev

API will be available at http://localhost:3000

--- 

## POST Body Example:

```text
{
	"name": "Test Pipeline",
	"action": "log"
}
```

---

## Database Table

Pipelines

```SQL
CREATE TABLE pipelines (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	action_type TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Subscribers

```SQL
CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  pipeline_id INT REFERENCES pipelines(id) ON DELETE CASCADE,
  url TEXT NOT NULL
);
```
Events(Jobs)

```SQL
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  pipeline_id INT REFERENCES pipelines(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',      -- pending / processing / success / failed
  attempts INT DEFAULT 0,             -- retry attempts
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_attempt TIMESTAMP
);
```

---

## 📡 API Endpoints

Pipelines

```text
POST /api/pipelines
```

```text
GET /api/pipelines
```

Subscribers

```text
POST /api/subscribers
```

```text
GET /api/pipelines/:pipelineId/subscribers
```

Jobs

```text
POST /api/jobs
```

Webhooks (legacy/testing)

```text
POST /api/webhooks
```

---

## Testing

Mock subscriber endpoint:

```text
POST /mock-subscriber
```

---

## Bash Through WSL Terminal(Test)

```text
curl -X POST http://localhost:3000/api/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-pipeline",
    "action": "uppercase"
}'
```

```text
curl -X POST http://localhost:3000/api/pipelines/1/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline_id": 1,
    "url": "http://app:3000/mock-subscriber"
}'
```

```text
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "uppercase",
    "data": {
      "text": "hello world"
    }
}'
```
  
```text
curl http://localhost:3000/api/jobs
```  
  
```text
  curl -X POST http://localhost:3000/api/pipelines/1/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline_id": 1,
    "url": "http://localhost:3000/non-existent"
}'
```

```text
  curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "uppercase",
    "data": { "text": "this will fail" }
}'
```

```text
  curl http://localhost:3000/api/jobs/2
```

---