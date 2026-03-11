# Database Schema Design

This document reflects the effective Supabase schema used by Workbench after the current migration set.

## Scope

Workbench uses a project-centric collaborative model with role-based access and family-friendly workflow features.  
The active app flow focuses on `board` and `epics`, while collaboration tables remain first-class and intentionally preserved.

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
  - Supports parent-child relation (`parent_id`) for one-level subtasks
  - Supports links to epics/sprints, extended priority and date fields
- `epics`
  - Objectives table with color and date metadata
- `sprints`
  - Iteration buckets, linked to tickets via `tickets.sprint_id`

### Collaboration

- `comments`
  - Ticket comments with author relation
- `ticket_assignees`
  - Many-to-many assignment table between tickets and users
- `labels`
  - Project-scoped labels
- `ticket_labels`
  - Join table between tickets and labels
- `project_invitations`
  - Token-based invitation workflow
- `user_profiles`
  - Public profile projection from auth users

### Billing / Plan

- `subscriptions`
  - User subscription state (`free/pro/team`) and billing metadata

## Key Relationships

- `projects.id` -> `boards.project_id` (1:1 logical)
- `projects.id` -> `columns` via `boards`
- `projects.id` -> `tickets.project_id`
- `projects.id` -> `epics.project_id`
- `projects.id` -> `sprints.project_id`
- `projects.id` -> `labels.project_id`
- `projects.id` -> `project_members.project_id`
- `projects.id` -> `project_invitations.project_id`

- `epics.id` -> `tickets.epic_id` (optional)
- `sprints.id` -> `tickets.sprint_id` (optional)
- `tickets.id` -> `tickets.parent_id` (optional self-reference)
- `tickets.id` -> `comments.ticket_id`
- `tickets.id` -> `ticket_assignees.ticket_id`
- `tickets.id` -> `ticket_labels.ticket_id`
- `labels.id` -> `ticket_labels.label_id`

## Important Constraints and Guarantees

- Non-empty names/titles/statuses enforced with database checks
- `short_code` is immutable 2-character project key
- Per-project code uniqueness:
  - `tickets(project_id, code_number)` unique
  - `epics(project_id, code_number)` unique
- One board per project via unique constraint on `boards.project_id`
- Column order/status consistency enforced by unique constraints on board scope

## Realtime Coverage

Realtime publication migrations ensure change streams are enabled for project workflow tables (including tickets, columns, and additional project detail tables used by the app synchronization layer).

## RPC / Function Highlights

The schema includes RPC helpers for:

- project creation and membership bootstrap
- project reclaim/join lifecycle
- project-level statistics (`get_projects_with_stats`)
- ticket move/reorder operations (transactional)
- assignee aggregation (ticket-level and project-level)
- invitation acceptance/decline and pending invitation retrieval
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

Even though the UI no longer exposes backlog/home flows, schema support for collaboration and planning remains intentionally broader:

- invitations, labels, sprints, comments, and assignees are retained as essential capabilities
- cleanup strategy is incremental and non-destructive for stability

## References

- `supabase/migrations/`
- `docs/supabase/migrations.md`
- `docs/supabase/row-level-security.md`
