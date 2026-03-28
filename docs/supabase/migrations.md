# Database Migrations Guide

This document describes the current migration strategy for Workbench and reflects the state of the `supabase/migrations` directory.

## Migration Model

- SQL migrations are stored in `supabase/migrations/`
- Files are applied in ascending order (`000001` -> `000049`), while preserving intentional gaps from earlier consolidation work
- Migrations should remain additive and idempotent whenever possible
- Destructive changes should be handled in dedicated, explicit migrations

## Current Migration Timeline

### Foundation and Access Control

- `000001_initial_schema.sql`  
  Creates core tables: `projects`, `boards`, `columns`, `epics`, `tickets` plus baseline indexes, constraints, and `updated_at` trigger logic.

- `000002_seed_default_project.sql`  
  Seeds an initial project, board, and default columns.

- `000003_add_project_members_and_rls.sql`  
  Adds `project_members`, helper functions (`is_project_member`, `is_project_admin`, etc.), and enables RLS across core tables.

- `000004_auto_add_creator_as_admin.sql`  
  Adds creator auto-membership behavior and `has_any_project_access()`.

- `000005_allow_users_to_add_themselves_as_viewer.sql`  
  Adjusts access bootstrapping flow.

- `000006_fix_project_creation_rls.sql`  
  Refines project creation policy behavior.

- `000007_bypass_rls_with_function.sql`  
  Adds controlled `SECURITY DEFINER` helpers for project creation/join flows.

### Ticket Identity / Stats

- `000008_add_ticket_epic_codes.sql`  
  Adds human-readable code support (`short_code`, `code_number`) and supporting functions. Epics are historical at this stage and are later removed by cleanup migrations.

- `000009_project_stats_function.sql`  
  Adds `get_projects_with_stats()`.

### Subscription and Project Lifecycle

- `000010_subscriptions.sql`  
  Introduces `subscriptions` table and related policies.

- `000011_fix_security_linter_warnings.sql`  
  Search path and policy hardening pass.

- `000012_orphaned_project_soft_delete.sql`  
  Adds orphaned project lifecycle (`orphaned_at`, `creator_email`, reclaim and cleanup functions).

### Collaboration Features

- `000013_user_profiles.sql`  
  Adds `user_profiles` with sync trigger and avatar update path. This table backs
  profile data, not session/identity state.

- `000014_project_invitations.sql`  
  Adds `project_invitations` and invitation RPC flows.

- `000015_ticket_assignees.sql`  
  Adds `ticket_assignees` and batch assignee RPC.

- `000016_user_profiles_single_source.sql`  
  Refines user profile synchronization/update behavior for the profile
  projection.

### Domain Enrichment

- `000017_ticket_extended_fields.sql`  
  Adds ticket extended fields (`priority`, `due_date`, `story_points`, `created_by`).

- `000018_epic_extended_fields.sql`  
  Adds epic extended fields (`start_date`, `target_date`, `color`) as part of the historical model.

- `000020_comments.sql`  
  Adds `comments` and comment retrieval RPC.

- `000021_labels.sql`  
  Adds `labels` and `ticket_labels` as part of the historical model.

### Positioning, Search, and Realtime

- `000022_transactional_positions.sql`  
  Adds transactional position update functions.

- `000023_fix_search_path_security.sql`  
  Hardens `search_path` on critical functions.

- `000024_bulk_update_ticket_positions.sql`  
  Adds JSON-based bulk position update function.

- `000025_move_and_reorder_ticket.sql`  
  Adds atomic move + reorder function.

- `000026_ticket_search_trigram.sql`  
  Adds trigram indexes for ticket title/description search.

- `000027_columns_workflow_state.sql`  
  Adds workflow state handling on columns.

- `000028_enable_realtime_for_project_views.sql`  
  Ensures `tickets` and `columns` are in `supabase_realtime` publication.

- `000029_enable_realtime_for_project_detail_tables.sql`  
  Extends realtime publication for project detail tables.

- `000030_project_ticket_assignees_rpc.sql`  
  Adds project-wide ticket assignees RPC.

### Invitations, Billing, and Storage Hardening

- `000031_fix_pending_invitations_ambiguous_id.sql`
  Fixes an ambiguous `id` reference in `get_pending_invitations()`.

- `000032_make_project_invitations_link_based.sql`
  Simplifies invitations to role-based links instead of email-bound invites.

- `000033_fix_project_invitations_rls_policy.sql`
  Restores a safe `project_invitations` SELECT policy for authenticated clients.

- `000034_enforce_last_admin_and_refine_invitation_errors.sql`
  Enforces the last-admin invariant and improves invitation acceptance errors.

- `000035_fix_last_admin_trigger_search_path.sql`
  Hardens trigger search-path behavior for the last-admin protection logic.

- `000036_add_runtime_billing_visibility_config.sql`
  Adds `app_runtime_config` for remotely toggling billing visibility.

- `000037_allow_owner_manual_user_deletion.sql`
  Allows the database owner to manually delete users without violating the last-admin invariant.

- `000038_restore_projects_rls_policies.sql`
  Restores missing `projects` RLS policies.

- `000039_avatars_storage_bucket.sql`
  Creates the public avatars storage bucket and related access policies.

### Archival and Board Simplification

- `000040_ticket_archival_fields.sql`
  Adds ticket archival metadata.

- `000041_filter_archived_from_project_ticket_assignees.sql`
  Excludes archived tickets from project-level assignee hydration.

- `000042_move_and_reorder_ticket_completed_at.sql`
  Keeps `completed_at` aligned with workflow-state transitions during drag and drop.

- `000043_remove_sprint_model.sql`
  Removes the sprint model from the effective schema.

- `000044_weekly_ticket_archival.sql`
  Adds the weekly archival batch for completed tickets.

- `000045_simplify_ticket_priority.sql`
  Simplifies ticket priorities from five levels to three.

- `000046_due_date_calendar_date.sql`
  Stores `due_date` as a timezone-safe calendar date.

- `000047_remove_legacy_epics_labels_subtasks.sql`
  Removes legacy epics, labels, `ticket_labels`, and subtask-specific ticket fields from the effective schema.

- `000048_delete_accepted_project_invitations.sql`
  Deletes consumed invitation rows and keeps link acceptance single-use.

- `000049_remove_invitation_email_and_pending_lookup.sql`
  Removes the legacy invitation email column and the unused email-based pending invitation lookup.

- `000051_restrict_project_reclaim_and_remove_self_join.sql`
  Removes the legacy self-join viewer policy and limits reclaim RPC access to orphaned projects owned by the same creator email.

## Out-of-Band Changes

An additional safe performance pass was applied directly to the remote project (not yet committed as a repository migration):

- Added indexes:
  - `idx_comments_author_id`
  - `idx_project_invitations_invited_by`
  - `idx_ticket_assignees_assigned_by`
  - `idx_tickets_created_by`

If database history must be fully reproducible from git only, add a dedicated migration file that contains those four index statements.

## How to Run Migrations

### Supabase CLI (recommended)

```bash
supabase link --project-ref <project-ref>
supabase db push
```

### Local reset

```bash
supabase start
supabase db reset
```

## Best Practices

- Keep migrations forward-only and explicit
- Prefer additive schema evolution over in-place destructive rewrites
- Use `IF EXISTS` / `IF NOT EXISTS` when safe and appropriate
- Test on local database before applying to shared environments
- Re-run Supabase advisors after DDL changes

## References

- `supabase/migrations/README.md`
- `docs/supabase/database-schema.md`
- `docs/supabase/row-level-security.md`
