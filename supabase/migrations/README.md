# Database Migrations

This directory contains SQL migration files for the Workbench database schema.

## Migration Files

Migrations are numbered sequentially and applied in order:

### Core Migrations (Required)

- `000001_initial_schema.sql` - Creates initial database schema (projects, tickets, epics, boards, columns)
- `000002_seed_default_project.sql` - Inserts default project, board, and columns (seed data)
- `000003_add_project_members_and_rls.sql` - Adds project_members table and Row Level Security policies
- `000004_auto_add_creator_as_admin.sql` - Auto-adds project creator as admin via trigger
- `000005_allow_users_to_add_themselves_as_viewer.sql` - Allows authenticated users to add themselves as viewer to projects

### Project Creation Fix

- `000006_fix_project_creation_rls.sql` - Fixes RLS policies for project creation (ensures permissions and working policies)
- `000007_bypass_rls_with_function.sql` - Creates SECURITY DEFINER functions to bypass RLS for project creation
- `000009_restore_missing_project_policies.sql` - Restores missing SELECT, UPDATE, and DELETE policies for projects table

## Running Migrations

See [docs/migrations.md](../../docs/migrations.md) for detailed instructions on running migrations.

Quick start:

```bash
# Using Supabase CLI (applies both schema and seed migrations)
supabase db push

# Or manually via Supabase Dashboard SQL Editor
# Copy and paste migration SQL files in order
```

## Seed Data

The seed migration (`000002_seed_default_project.sql`) creates:

- Default project: "My Workbench"
- Default board linked to the project
- Three default columns: "To Do", "In Progress", "Done"

The seed migration is **idempotent** - safe to run multiple times. See [docs/migrations.md](../../docs/migrations.md) for more details.

## Creating New Migrations

1. Create a new file: `000002_descriptive_name.sql`
2. Write idempotent SQL (use `IF NOT EXISTS`, `IF EXISTS`)
3. Test on a clean database
4. Apply using one of the methods above

See [docs/migrations.md](../../docs/migrations.md) for best practices.
