# Changelog

All notable changes to this project will be documented in this file.

---

## [v0.1] - 2026-03-17
- Initial pipelines module implemented
- POST /api/pipelines & GET /api/pipelines endpoints
- TypeScript interfaces (`Pipeline`, `ActionType`)
- Zod input validation
- PostgreSQL integration (`pipelines` table)
- README.md, .gitignore, .env.example added

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

## [Unreleased]
- Docker support
- CI/CD (GitHub Actions)

---

## [v0.4.0] - 2026-03-19
### Docker & CI/CD
- Added **Docker & Docker Compose** support for API, worker, Postgres, and Redis
- CI/CD GitHub Actions workflow added:
  - Builds TypeScript
  - Spins up Postgres + Redis
  - Seeds test pipeline, subscriber, and job
  - Runs worker
  - Verifies jobs processed successfully
- No formal test files required; workflow acts as **functional smoke test**

---

## [Unreleased]
- Clean The Mess
- Enhance & Do Clean Code