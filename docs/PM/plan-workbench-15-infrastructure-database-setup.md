---
Generated: 2025-12-23 12:05:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-15
---

# Implementation Plan: Infrastructure – Database & Supabase Setup

## Summary

Goal: Configure Supabase, design the relational schema (Project, Ticket, Epic, Board, Column), set up migrations and seed data, and wire at least one repository + usecase end-to-end so all future features can rely on a stable, repeatable persistence layer.
Constraints: Must follow Clean Architecture (ports in `core/ports`, implementations in `infrastructure/supabase`, usecases orchestrating logic), avoid UI → Supabase coupling, and keep migrations/seed scripts idempotent and automatable.

## Solution Outline

- **Domain (core/domain)**: Finalize entities and Zod schemas for Project, Ticket, Epic, Board, Column aligned with the database schema; define domain error types for repository failures.
- **Usecases (core/usecases)**: Implement one or two core usecases (e.g. `getProject`, `listTickets`) that depend only on repository ports; validate input/output with Zod.
- **Ports (core/ports)**: Define repository interfaces (ProjectRepository, TicketRepository, etc.) that hide Supabase specifics and expose domain-shaped operations.
- **Infrastructure (infrastructure/supabase)**: Configure Supabase client (already present) for runtime usage, implement repositories + mappers, manage migrations and seed data (via Supabase migrations or SQL scripts).
- **Presentation (presentation/hooks)**: Optionally wire a minimal React Query hook (e.g. `useProject`) to exercise the stack, but keep the bulk of UI work for later tickets.

## Sub-Tickets

### 15.1 - Supabase Project & Environment Setup

- AC: [x] Supabase project created in the correct org [x] Environment variables for URL and publishable key configured and validated in code [x] Basic dashboard settings (auth, RLS default) reviewed and documented
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A
- Effort: 1h | Deps: none

### 15.2 - Database Schema Design for Core Entities

- AC: [x] Schema drafted for Project, Ticket, Epic, Board, Column (tables + relations) [x] ERD or textual schema documentation added under `docs/` or `report/planning/` [x] Schema reviewed against domain model in section 2
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A
- Effort: 2h | Deps: 15.1

### 15.3 - Migration System & Initial Migrations

- AC: [x] Migration tooling decided (Supabase migrations / SQL) and documented [x] Initial migration creates all tables, PK/FK, unique and check constraints [x] Migrations can be applied on a clean environment without manual tweaks
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A
- Effort: 2h | Deps: 15.2

### 15.4 - Seed Data for Default Project & Board

- AC: [x] Seed script or migration inserts a default project and basic board/columns [x] Seed process documented (local + CI usage) [x] Seed is safe to re-run or clearly idempotent
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A
- Effort: 1h | Deps: 15.3

### 15.5 - Repository Ports & First Supabase Implementation

- AC: [x] Repository interfaces defined in `core/ports` for at least Project and Ticket [x] Supabase implementations created in `infrastructure/supabase` with proper mappers [x] Errors from Supabase mapped to domain-level error types
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A
- Effort: 2h | Deps: 15.2, 15.3

### 15.6 - Reference Usecase & Optional Hook Wiring

- AC: [x] At least one usecase (e.g. `getProject` or `listTickets`) implemented using the new repositories [x] Simple end-to-end path verified (manual or via a minimal React Query hook) [x] Observability hooks (logging/error mapping) considered but detailed work deferred to observability tickets
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A
- Effort: 1.5h | Deps: 15.5

### 15.7 - Restrict access to the database to connected user only

- AC: [x] only connected users to the selected project can view and access the project [x] only allowed users can edit / delete tickets
- DoD: [x] restrict project database to allowed users [x] add users status to allow / prevent users to edit / delete tickets [x] restrict allow user to delete project (admin only)

### 15.8 - Ensure only connected users can access to Workbench

- AC: [x] only connected users can have access to Workbench [x] only granted permission user can access to a specific board [x] only granted user can edit / remove project specifities [x] differents user roles are setup
- DoD: [x] different user roles are setup [x] provide a id to access to the database when user connect or admin can add user to the project [x] a new user can only create a new dashboard if he has no access to any database

## Unit Test Spec

- **File paths (examples)**:
  - `__tests__/core/domain/project.schema.test.ts`
  - `__tests__/core/domain/ticket.schema.test.ts`
  - `__tests__/core/usecases/getProject.test.ts`
  - `__tests__/core/usecases/listTickets.test.ts`
  - `__tests__/infrastructure/supabase/projectRepositorySupabase.test.ts` (optional, or via usecases only)
- **Key tests**:
  - Domain schemas reject invalid payloads coming from Supabase (missing fields, wrong types)
  - Repositories correctly map Supabase rows to domain entities (happy path + null/empty responses)
  - Usecases call the right repository methods and handle domain errors
  - Migrations can be applied in sequence without error in a test database (smoke test)
- **Status**: tests proposed

## Agent Prompts

- **Unit Test Coach**: "Design unit tests for domain schemas, repository mappings, and the first usecases (`getProject` / `listTickets`) to validate the new database and Supabase integration."
- **Architecture-Aware Dev**: "Implement sub-tickets 15.1–15.6 to set up Supabase, database schema, migrations, seed data, repository ports/implementations, and one reference usecase, strictly following Clean Architecture."
- **UI Designer**: "Prepare how future UI (board, backlog) will consume the new repositories/usecases, ensuring loading/error/empty states align with the shared observability and feedback components."
- **QA & Test Coach**: "Define a minimal test plan to validate the database schema, migrations, seed data, and first usecases end-to-end (including rollback/reseed scenarios)."

## Open Questions

1. Do we need multi-tenant support (multiple projects per user/team) in the initial schema, or is a single-project assumption acceptable for the MVP?
2. Should migrations and seed scripts be run automatically in CI, or only manually by developers for now?
