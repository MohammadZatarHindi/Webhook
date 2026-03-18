# Changelog

All notable changes to this project will be documented in this file.

## [v0.1] - 2026-03-17
- Initial pipelines module implemented
- POST /api/pipelines & GET /api/pipelines endpoints
- TypeScript interfaces (`Pipeline`, `ActionType`)
- Zod input validation
- PostgreSQL integration (`pipelines` table)
- README.md, .gitignore, .env.example added

## [Unreleased]
- Webhooks module
- Async queue processing
- Pipeline actions (uppercase, reverse, log)