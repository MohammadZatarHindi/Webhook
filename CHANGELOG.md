# Changelog

All notable changes to this project will be documented in this file.

---

## [v0.4.0] - 2026-03-24

###Major Update: Production Readiness & Architectural Refactoring

This release transforms the system into a robust, "Modular Monolith" with a professional-grade technical foundation and containerized orchestration.

---

### Added

- Programmatic Migration Engine: Integrated a migration CLI to handle database schema evolution.

- Versioned Schema Control: Added up (apply changes) and down (rollback changes) migration scripts to ensure all team members and environments (Docker/CI) stay in sync.

- Migration History: The system now tracks applied migrations in a migrations metadata table, preventing duplicate executions.

- Many-to-Many (M-M) Fan-out: Implemented the subscriptions join table to allow a single pipeline to broadcast data to multiple subscribers simultaneously.

- Docker Orchestration: Full Dockerfile and docker-compose.yml integration for a one-click "API + Worker + DB" environment.

- Generic Data Access Layer (DAL): Implemented genericQueries.ts to abstract PostgreSQL CRUD operations, reducing boilerplate across all modules.

- Global Error Strategy: - Custom AppError class for operational error handling.

- catchAsync utility to eliminate repetitive try/catch blocks.

- Environment Validation: Integrated Zod-based validation for .env variables at startup.

- Graceful Shutdown: Implemented SIGTERM/SIGINT handlers to ensure the PostgreSQL pool closes cleanly and the worker finishes its heartbeat before exiting.

- Audit Trail: Expanded the deliveries table to log granular HTTP status codes and response bodies for every egress attempt.

### Fixed

- Relational Integrity: Updated SQL schema with ON DELETE CASCADE and strict Foreign Key constraints.

---

## [v0.3.0] - 2026-03-19

### Major Update: Async Job & Pipeline Processing

This release upgrades the system from a simple webhook receiver to a full **asynchronous pipeline processing system**.

---

### Added

#### Subscribers Module
- Added `subscribers` table
- Ability to attach multiple subscriber URLs per pipeline
- Dynamic webhook delivery system

#### Jobs / Events Module
- Added `events` table for async job processing
- Stores payload, status, retry attempts, and errors
- Introduced job lifecycle: `pending → processing → success / failed`

#### Worker System
- Background worker (`worker.ts`) processes jobs every 2 seconds
- Applies pipeline actions dynamically
- Sends processed results to subscribers

#### Action Engine
- Implemented pipeline actions:
  - `log`
  - `uppercase`
  - `reverse`
- Dynamic execution based on pipeline configuration

#### Retry Mechanism
- Job retry up to 3 attempts
- Subscriber retry up to 3 attempts per endpoint
- Delay between retries
- Error tracking and logging

---

### Database Changes

- Added `subscribers` table
- Added `events` table
- Deprecated `webhooks` table (now used only for testing/legacy)

---

### Improvements

- Introduced async processing architecture
- Separated API and worker responsibilities
- Improved job locking using `FOR UPDATE SKIP LOCKED`
- Prevented duplicate job processing

---

### Fixed

- Retry loop inconsistencies
- Worker crash on failed delivery
- Database connection handling

---

## [v0.2] - 2026-03-18
- Webhooks module implemented
- `webhooks` table added in PostgreSQL
- POST /api/webhooks endpoint to receive and store webhooks
- Manual and HTTP tests verified
- Status tracking (`pending`, `processed`, `failed`) added
- JSONB payload storage for flexible webhook data
- Optional extras discussed: validation, security, indexing, cleanup

---

## [v0.1] - 2026-03-17
- Initial pipelines module implemented
- POST /api/pipelines & GET /api/pipelines endpoints
- TypeScript interfaces (`Pipeline`, `ActionType`)
- Zod input validation
- PostgreSQL integration (`pipelines` table)
- README.md, .gitignore, .env.example added

---