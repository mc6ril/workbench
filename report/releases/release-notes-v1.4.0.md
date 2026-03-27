---
Generated: 2026-03-27 15:44:24
Report Type: release
Version: 1.4.0
---

# Workbench v1.4.0

## Summary

This release completes the board simplification effort by removing epics, labels, subtasks, and related settings UI. It also improves ticket detail UX, tightens data model semantics around due dates, and cleans up remaining legacy and settings dead code. It includes database migrations; review and apply them before deploying.

## Highlights

### Board simplification

- **Remove epics, labels, subtasks** — Domain, use cases, UI components, and tests removed across the board module.
- **Simplify priorities** — Ticket priority model simplified, including a dedicated migration.
- **Settings cleanup** — Removes no-longer-needed settings pages/sections and dead code paths.

### Ticket detail UX

- **Ticket detail UI update** — Ticket detail view refined and expanded (new header/status bar and layout improvements).
- **Priority indicator** — Adds a dedicated priority dot component for better at-a-glance scanning.

### Data model & migrations

- **Due date semantics** — Fixes due date timezone drift and introduces a calendar-date approach where needed.
- **Migrations added**
  - `supabase/migrations/000045_simplify_ticket_priority.sql`
  - `supabase/migrations/000046_due_date_calendar_date.sql`
  - `supabase/migrations/000047_remove_legacy_epics_labels_subtasks.sql`

## Included branch changes (toward `main`)

### `main-dev` → `main`

- Removes epics/labels/subtasks end-to-end (domain + UI + infrastructure + tests).
- Simplifies ticket priorities (and adds `000045_simplify_ticket_priority.sql`).
- Major ticket detail view refresh.

### `code-review-board-simplification` → `main`

- Fixes due date timezone drift and adds due date migrations (`000046_*`).
- Removes remaining settings dead code and legacy remnants.
- Adds final cleanup migration (`000047_*`) plus docs and tests alignment.

## Upgrade notes

- Apply the new Supabase migrations before deploying.
- Run `yarn test` and validate the board and ticket detail screens (especially due date behavior).

