# Row Level Security (RLS) and Permissions

This document summarizes how RLS protects Workbench data in Supabase.

## Security Model

- RLS is enabled on all application tables in `public`
- Access is scoped by authenticated user identity (`auth.uid()`)
- Project membership is the main authorization boundary
- Service-role operations are reserved for trusted server contexts only

## Membership and Roles

Membership is stored in `project_members`:

- `admin`
  - full project administration
  - can manage members and destructive project actions
- `member`
  - can create and edit project work data
- `viewer`
  - read-only access

## Helper Functions Used by Policies

Core helper functions include:

- `is_project_member(project_uuid uuid)`
- `get_project_role(project_uuid uuid)`
- `is_project_admin(project_uuid uuid)`
- `can_edit_project(project_uuid uuid)`
- `has_any_project_access()`

Project lifecycle functions include:

- `create_project(project_name text)`
- `reclaim_or_join_project(project_uuid uuid)`
- `get_reclaimable_projects()`
- `cleanup_expired_orphaned_projects()`

Invitation and profile collaboration functions include:

- `accept_invitation(invitation_token text)`
- `decline_invitation(invitation_token text)`
- `get_pending_invitations()`
- `update_user_profile(...)`

## Policy Intent by Domain

### Projects and Membership

- Read projects only when member of the project
- Create projects as authenticated users (with controlled bootstrap behavior)
- Update/delete limited by role checks
- Membership table operations restricted to admin-grade actions

### Workflow Data (`boards`, `columns`, `tickets`, `epics`, `sprints`)

- Read when project member
- Write when edit-capable (`admin` or `member`)
- Viewer role remains read-only

### Collaboration Data (`comments`, `labels`, `ticket_labels`, `ticket_assignees`, `project_invitations`)

- Read scoped to related project membership
- Write constrained by editor/admin permissions and ownership rules where applicable

### User Projection Data (`user_profiles`, `subscriptions`)

- User profile and subscription access are constrained to appropriate self/member scopes
- `user_profiles` supports the app-level profile projection; authenticated
  identity still comes from Supabase Auth/session state

## Operational Notes

### RLS performance

Supabase advisors currently report optimization opportunities for some policies that call `auth.*` directly.

Recommended optimization pattern:

```sql
-- Preferred in policy expressions
(select auth.uid())
```

instead of row-by-row function evaluation forms.

### Multiple permissive policies

Some tables may intentionally have multiple permissive policies (for different collaboration paths), but this can carry planner cost.  
Consolidate policy logic only when behavior remains identical and fully tested.

## Testing Checklist

- Authenticated non-member cannot read target project data
- Viewer cannot mutate tickets/epics/columns/comments
- Member can mutate allowed workflow data
- Admin can manage members and admin-only actions
- Invitation flow honors token, expiration, and membership constraints
- Reclaim/orphan lifecycle remains restricted to valid user context

## References

- `supabase/migrations/000003_add_project_members_and_rls.sql`
- `supabase/migrations/000011_fix_security_linter_warnings.sql`
- `supabase/migrations/000014_project_invitations.sql`
- `supabase/migrations/000020_comments.sql`
- `docs/supabase/database-schema.md`
