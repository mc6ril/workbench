# Row Level Security (RLS) and Permissions

This document describes the Row Level Security policies and permission system for Workbench.

## Overview

Workbench uses Supabase Row Level Security (RLS) to restrict database access to authorized users only. All tables are protected by RLS policies that ensure users can only access and modify data for projects where they are members.

## Project Membership System

### Project Members Table

The `project_members` table links users to projects with specific roles:

| Column     | Type        | Description                      |
| ---------- | ----------- | -------------------------------- |
| id         | uuid        | Primary key                      |
| project_id | uuid        | Foreign key to projects          |
| user_id    | uuid        | Foreign key to auth.users        |
| role       | text        | User role: admin, member, viewer |
| created_at | timestamptz | Creation timestamp               |
| updated_at | timestamptz | Last update timestamp            |

### User Roles

Three roles are available for project members:

- **admin**: Full access to the project
  - Can view, create, update, and delete all project data
  - Can add/remove project members
  - Can delete the project
  - Can update project settings

- **member**: Can edit project data
  - Can view all project data
  - Can create, update, and delete tickets, epics, boards, and columns
  - Cannot delete the project
  - Cannot manage project members

- **viewer**: Read-only access
  - Can view all project data
  - Cannot create, update, or delete any data
  - Cannot manage project members

## Helper Functions

The following helper functions are available for RLS policies:

### `is_project_member(project_uuid uuid)`

Returns `true` if the current user is a member of the specified project.

```sql
SELECT is_project_member('00000000-0000-0000-0000-000000000001');
```

### `get_project_role(project_uuid uuid)`

Returns the current user's role in the specified project (or `NULL` if not a member).

```sql
SELECT get_project_role('00000000-0000-0000-0000-000000000001');
-- Returns: 'admin', 'member', 'viewer', or NULL
```

### `is_project_admin(project_uuid uuid)`

Returns `true` if the current user is an admin of the specified project.

```sql
SELECT is_project_admin('00000000-0000-0000-0000-000000000001');
```

### `can_edit_project(project_uuid uuid)`

Returns `true` if the current user can edit the specified project (admin or member role).

```sql
SELECT can_edit_project('00000000-0000-0000-0000-000000000001');
```

### `has_any_project_access()`

Returns `true` if the current user has access to any project (is a member of at least one project).

```sql
SELECT has_any_project_access();
```

## RLS Policies

### Projects

- **SELECT**: Users can view projects where they are members
- **INSERT**: Authenticated users can create projects only if they have no existing project access (creator is automatically added as admin)
- **UPDATE**: Users can update projects where they have edit permission (admin or member)
- **DELETE**: Only admins can delete projects

**Note**: When a project is created, the creator is automatically added as an `admin` member via a database trigger.

### Project Members

- **SELECT**: Users can view project members for projects where they are members
- **INSERT**: Only admins can add project members
- **UPDATE**: Only admins can update project members (change roles)
- **DELETE**: Only admins can remove project members

### Tickets

- **SELECT**: Users can view tickets for projects where they are members
- **INSERT**: Users can create tickets if they have edit permission (admin or member)
- **UPDATE**: Users can update tickets if they have edit permission (admin or member)
- **DELETE**: Users can delete tickets if they have edit permission (admin or member)

### Epics

- **SELECT**: Users can view epics for projects where they are members
- **INSERT**: Users can create epics if they have edit permission (admin or member)
- **UPDATE**: Users can update epics if they have edit permission (admin or member)
- **DELETE**: Users can delete epics if they have edit permission (admin or member)

### Boards

- **SELECT**: Users can view boards for projects where they are members
- **INSERT**: Authenticated users can create boards (if they are project members)
- **UPDATE**: Users can update boards if they have edit permission (admin or member)
- **DELETE**: Boards are deleted automatically when projects are deleted (CASCADE)

### Columns

- **SELECT**: Users can view columns for boards where they are project members
- **INSERT**: Users can create columns if they have edit permission (admin or member)
- **UPDATE**: Users can update columns if they have edit permission (admin or member)
- **DELETE**: Users can delete columns if they have edit permission (admin or member)

## Security Notes

1. **RLS is enabled on all tables**: No data can be accessed without proper policies.

2. **Policies use `auth.uid()`**: All policies check the current authenticated user via Supabase's `auth.uid()` function.

3. **Helper functions are SECURITY DEFINER**: The helper functions use `SECURITY DEFINER` to ensure they can access `auth.uid()` correctly.

4. **Service role key bypasses RLS**: The service role key should never be used in client-side code. It's reserved for administrative tasks and server-side operations.

5. **Cascade deletes**: When a project is deleted, all related data (tickets, epics, boards, columns, project members) is automatically deleted due to CASCADE constraints.

## Creating Projects

When a user creates a project:

1. The user must be authenticated
2. The user must not have access to any existing project (enforced by RLS policy)
3. The project is created
4. The creator is automatically added as an `admin` member via database trigger

This ensures that each user can only have one project (MVP assumption), and the creator automatically becomes the project admin.

## Adding Users to Projects

To add a user to a project, insert a row into `project_members`:

```sql
INSERT INTO project_members (project_id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'user-uuid-here',
  'member'
);
```

**Note**: Only admins can add project members (enforced by RLS policy).

## Migrations

- **Migration 000003**: Creates project_members table and RLS policies
- **Migration 000004**: Adds auto-add creator as admin trigger and restricts project creation to users without existing projects

## Testing RLS Policies

To test RLS policies:

1. Create test users in Supabase Auth
2. Create project memberships with different roles
3. Authenticate as different users and verify access restrictions
4. Test that unauthorized access attempts are blocked

## Future Enhancements

Possible future enhancements to the permission system:

- Role-based permissions for specific operations (e.g., assign tickets, change ticket status)
- Project-level permissions (e.g., restrict ticket creation to certain roles)
- Team/organization-level permissions
- Time-based access (e.g., temporary access)
