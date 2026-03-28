# Database Schema Design

This document reflects the effective Supabase schema used by Workbench after the current migration set.

## Scope

Workbench uses a project-centric collaborative model with role-based access and a simplified board workflow.  
The current product keeps tickets, comments, assignees, invitations, and billing data. Legacy epics, labels, sprints, and subtasks are removed by forward migrations.

## Tables (public schema)

### Core Project Structure

- `projects`
  - Core project metadata (`name`, `short_code`, orphan lifecycle fields)
- `project_members`
  - Membership and role (`admin`, `member`, `viewer`)
- `boards`
  - One board per project (`project_id` unique)
- `columns`
  - Board columns with order and workflow metadata

### Work Items

- `tickets`
  - Main work item table
  - Includes workflow status, position, priority, due date, archival metadata, story points, creator metadata, and per-project code numbers

### Collaboration

- `comments`
  - Ticket comments with author relation
- `ticket_assignees`
  - Many-to-many assignment table between tickets and users
- `project_invitations`
  - Token-based invitation workflow
- `user_profiles`
  - Public profile projection from Supabase Auth users
  - Backs the app-level `profile` owner, not session/identity state

### Billing / Plan

- `subscriptions`
  - User subscription state (`free/pro/team`) and billing metadata
- `app_runtime_config`
  - Runtime flags for product surfaces such as billing visibility

## Key Relationships

- `projects.id` -> `boards.project_id` (1:1 logical)
- `projects.id` -> `columns` via `boards`
- `projects.id` -> `tickets.project_id`
- `projects.id` -> `project_members.project_id`
- `projects.id` -> `project_invitations.project_id`

- `tickets.id` -> `comments.ticket_id`
- `tickets.id` -> `ticket_assignees.ticket_id`

## Important Constraints and Guarantees

- Non-empty names/titles/statuses enforced with database checks
- `short_code` is immutable 2-character project key
- Per-project code uniqueness: `tickets(project_id, code_number)` unique
- One board per project via unique constraint on `boards.project_id`
- Column order/status consistency enforced by unique constraints on board scope
- Ticket due dates are stored as timezone-safe calendar dates (`date`)

## Realtime Coverage

Realtime publication migrations ensure change streams are enabled for tickets, columns, comments, project members, and ticket assignees.

## RPC / Function Highlights

The schema includes RPC helpers for:

- project creation and membership bootstrap
- orphaned project reclaim lifecycle
- project-level statistics (`get_projects_with_stats`)
- ticket move/reorder operations (transactional)
- assignee aggregation (ticket-level and project-level)
- invitation acceptance/decline
- comment retrieval

## Indexing Notes

The migration set includes baseline indexes for project/workflow access patterns and search indexes for ticket text lookup.

Additionally, a safe production performance pass added missing foreign-key support indexes:

- `idx_comments_author_id`
- `idx_project_invitations_invited_by`
- `idx_ticket_assignees_assigned_by`
- `idx_tickets_created_by`

These indexes reduce planner regressions on joins/filtering without schema-breaking changes.

## Current Product Alignment

The schema now matches the simplified board product:

- tickets are the only work-item level
- comments, assignees, invitations, and archival flows remain first-class
- legacy epics, labels, sprints, and subtasks are removed through forward cleanup migrations

## References

- `supabase/migrations/`
- `docs/supabase/migrations.md`
- `docs/supabase/row-level-security.md`
