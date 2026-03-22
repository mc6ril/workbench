# Accepted Architecture Exceptions

## Purpose

The default architecture rules live in:

- `README.md`
- `docs/architecture/repositories.md`
- `docs/architecture/user-flows.md`
- `docs/architecture/identity-ownership.md`

This document lists the exceptions that are intentional in the current codebase.

These exceptions are:

- allowed
- narrow in scope
- not the default pattern to copy elsewhere without updating the docs

If one of these exceptions grows beyond the guardrails below, it should be
treated as architecture drift rather than as an approved pattern.

Owner-to-owner compatibility shims are not accepted exceptions.
In particular, `workspace -> project` re-export paths are considered drift and
must be replaced with direct imports from the canonical `project` owner.

## 1. Shared Feature Access Bridge

- Canonical import: `@/shared/featureAccess`
- Implementation owner: `src/domains/billing/`

### Why this exists

Feature entitlement primitives are consumed in multiple places across the
product surface, especially in project-shell and module presentation code.
A thin shared bridge provides a stable import path while keeping billing as the
owner of the underlying rules and hooks.

### Guardrails

- `src/shared/featureAccess.ts` stays a thin re-export surface
- entitlement computation, pricing rules, and subscription-fetching behavior
  remain in `src/domains/billing/`
- if the bridge starts accumulating business logic, ownership must move back to
  an explicit owner layer

## 2. Owner-Local Supabase Row Types

- Canonical locations:
  - `src/domains/*/infrastructure/supabase/types.ts`
  - `src/modules/*/infrastructure/supabase/types.ts`

### Why this exists

These types represent low-level Supabase table rows and RPC payloads.
They are persistence-shape contracts, not domain entities.
Keeping them with the owning infrastructure layer avoids mixed ownership in
shared and keeps boundaries explicit.

### Guardrails

- only low-level database rows and RPC payloads belong in these owner-local
  files
- mapping to domain entities stays in each owner mapper/repository
- these types may reference owner-owned scalar enums/unions when needed for
  type safety
- no business behavior, use cases, permissions, or owner orchestration belongs
  in these files

## 3. Top-Level Presentation Root For Public/Static Pages

- Canonical location: `src/presentation/pages/`
- Current scope: landing and legal

### Why this exists

Some pages are app-level public/static surfaces rather than project-container
governance screens or project modules. For those pages, a top-level
presentation root is currently acceptable.

### Guardrails

- only pages composed from `src/app/(public)` or `src/app/(static)` belong here
- no protected project flows belong here
- no repository wiring or owner business orchestration belongs here
- if a stable owner emerges later, these pages can migrate into that owner

## Review Guidance

The items above should not be reported as architecture violations by default.

They should be reported only when:

- the implementation exceeds the documented guardrails
- business logic starts leaking into the thin bridges
- public/static presentation starts hosting protected or owner-specific flows
