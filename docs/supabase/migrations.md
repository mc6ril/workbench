# Database Migrations Guide

This document describes the database migration system for Workbench and how to run migrations.

## Migration System

Workbench uses **Supabase migrations** with SQL files stored in `supabase/migrations/`. Migrations are numbered sequentially and applied in order to create and modify the database schema.

## Directory Structure

```
supabase/
└── migrations/
    ├── 000001_initial_schema.sql
    └── ...
```

Migration files follow the naming convention:

- `{timestamp}_{descriptive_name}.sql`
- Example: `000001_initial_schema.sql`, `000002_add_priority_to_tickets.sql`

## Migration Files

### Initial Schema Migration

**File**: `supabase/migrations/000001_initial_schema.sql`

This migration creates the initial database schema:

- **Tables**: `projects`, `tickets`, `epics`, `boards`, `columns`
- **Foreign Keys**: All relationships between entities
- **Unique Constraints**: Board per project, column status/position per board
- **Check Constraints**: Position >= 0 for tickets and columns
- **Indexes**: Performance indexes on foreign keys and frequently queried fields
- **Triggers**: Automatic `updated_at` timestamp updates

See `docs/database-schema.md` for detailed schema documentation.

### Seed Data Migration

**File**: `supabase/migrations/000002_seed_default_project.sql`

This migration inserts initial seed data:

- **Default Project**: One project named "My Workbench"
- **Default Board**: One board linked to the default project
- **Default Columns**: Three columns with status values:
  - "To Do" (status: `todo`, position: 0)
  - "In Progress" (status: `in_progress`, position: 1)
  - "Done" (status: `done`, position: 2)

**Idempotency**: This migration is idempotent and safe to re-run. It uses fixed UUIDs and `ON CONFLICT` clauses to prevent duplicate inserts.

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed and your project linked:

1. **Link your project** (if not already linked):

   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Push migrations to Supabase**:

   ```bash
   supabase db push
   ```

   This will apply all migrations that haven't been applied yet.

3. **Check migration status**:
   ```bash
   supabase migration list
   ```

### Option 2: Using Supabase Dashboard

1. **Open Supabase Dashboard**: Go to your project at [app.supabase.com](https://app.supabase.com)

2. **Navigate to SQL Editor**: Go to **SQL Editor** in the left sidebar

3. **Run migration SQL**:
   - Copy the contents of `supabase/migrations/000001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

4. **Verify**: Check that all tables are created in the **Table Editor**

### Option 3: Using psql (Command Line)

If you have direct database access:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/000001_initial_schema.sql
```

Or using a connection string from Supabase Dashboard → Settings → Database:

```bash
psql "your-connection-string" -f supabase/migrations/000001_initial_schema.sql
```

## Creating New Migrations

1. **Create a new migration file** in `supabase/migrations/`:

   ```bash
   # Using Supabase CLI (generates timestamp automatically)
   supabase migration new add_feature_name

   # Or manually create: 000002_descriptive_name.sql
   ```

2. **Write migration SQL**:

   ```sql
   -- Example: Add a new column
   ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority text;

   -- Example: Create a new index
   CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
   ```

3. **Make migrations idempotent**:
   - Use `IF NOT EXISTS` for tables, indexes, constraints
   - Use `IF EXISTS` for drops
   - Check for existing data before inserting

4. **Test the migration**:
   - Apply to a local/test database first
   - Verify the migration succeeds on a clean database
   - Verify the migration is idempotent (can be run multiple times safely)

5. **Apply to your database** using one of the methods above

## Migration Best Practices

### Idempotency

All migrations should be **idempotent** - safe to run multiple times without errors. Use PostgreSQL conditional statements:

```sql
-- ✅ Good: Idempotent
CREATE TABLE IF NOT EXISTS projects (...);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- ❌ Bad: Not idempotent (will fail on second run)
CREATE TABLE projects (...);
CREATE INDEX idx_projects_name ON projects(name);
```

### Ordering

- Migrations are applied in **alphabetical/numerical order**
- Use sequential prefixes: `000001_`, `000002_`, etc.
- Never rename applied migrations (creates tracking issues)

### Backwards Compatibility

- When adding columns, make them nullable or provide defaults
- Avoid breaking changes in migrations (prefer additive changes)
- For breaking changes, create a new migration after deprecation period

### Dependencies

- Create tables in dependency order (parent tables before child tables)
- Drop tables in reverse dependency order (child tables before parent tables)

### Testing

- Test migrations on a clean database
- Test migrations on a database with existing data
- Verify indexes are created correctly
- Verify foreign key constraints work as expected

## Migration File Structure

Each migration file should include:

1. **Header comment** describing what the migration does
2. **CREATE statements** for new tables/columns/indexes
3. **ALTER statements** for modifications
4. **Comments** explaining non-obvious decisions

Example:

```sql
-- Migration: Add priority field to tickets
-- Description: Adds a priority text field to support ticket prioritization

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority text;

CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
```

## Troubleshooting

### Migration Already Applied

If a migration has already been applied and you try to run it again:

- **Supabase CLI**: Will skip already-applied migrations automatically
- **Manual SQL**: Use `IF NOT EXISTS` clauses to avoid errors

### Foreign Key Constraint Errors

If you get foreign key constraint errors:

1. Check table creation order (parent tables before child tables)
2. Verify foreign key relationships are correct
3. Check if referenced data exists before creating constraints

### Index Creation Errors

If index creation fails:

- Check if the index already exists (use `IF NOT EXISTS`)
- Verify column names are correct
- Check for duplicate index names

### Trigger Errors

If trigger creation fails:

- Verify the trigger function exists
- Check table names are correct
- Ensure triggers don't conflict with existing ones

## Verifying Migrations

After running migrations, verify:

1. **Tables created**: Check all tables exist in Supabase Dashboard → Table Editor
2. **Foreign keys**: Verify relationships in Table Editor → Foreign Keys tab
3. **Indexes**: Check indexes in Supabase Dashboard → Database → Indexes
4. **Constraints**: Verify unique and check constraints are applied
5. **Triggers**: Check triggers in Supabase Dashboard → Database → Triggers

## Migration History

Supabase tracks applied migrations in the `supabase_migrations.schema_migrations` table. To view migration history:

```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

## Rollback

Supabase migrations are **forward-only** by default. To rollback:

1. **Create a new migration** that reverses the changes
2. **Test the rollback migration** on a copy of the database
3. **Apply the rollback migration** using normal migration process

Example rollback migration:

```sql
-- Migration: Remove priority field from tickets (rollback)
-- Description: Removes the priority column added in migration 000002

ALTER TABLE tickets DROP COLUMN IF EXISTS priority;
DROP INDEX IF EXISTS idx_tickets_priority;
```

## Local Development

For local development with Supabase CLI:

1. **Start local Supabase**:

   ```bash
   supabase start
   ```

2. **Run migrations locally**:

   ```bash
   supabase db reset  # Resets and applies all migrations
   # or
   supabase migration up  # Applies pending migrations
   ```

3. **Check local database**:
   ```bash
   supabase db dump  # View current schema
   ```

## Seed Data

Seed data is included as part of the migration system. The seed migration (`000002_seed_default_project.sql`) runs automatically when you apply migrations.

### Seed Data Contents

- **Default Project**: "My Workbench" (ID: `00000000-0000-0000-0000-000000000001`)
- **Default Board**: Linked to default project (ID: `00000000-0000-0000-0000-000000000002`)
- **Default Columns**: Three columns for basic workflow:
  - To Do (status: `todo`)
  - In Progress (status: `in_progress`)
  - Done (status: `done`)

### Idempotency

The seed migration is **idempotent** - it's safe to run multiple times:

- Uses fixed UUIDs for all seed records
- Uses `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE` to prevent duplicates
- Updates existing records if names/values have changed

### Running Seed Data Separately

If you need to re-seed data without re-running all migrations:

```sql
-- Run only the seed migration
\i supabase/migrations/000002_seed_default_project.sql
```

Or via Supabase Dashboard SQL Editor - copy and paste the seed migration file contents.

### Customizing Seed Data

To customize seed data:

1. **Before first migration**: Edit `supabase/migrations/000002_seed_default_project.sql` and change names, status values, or add more columns

2. **After migration applied**: Create a new migration to update seed data:
   ```sql
   -- Example: Update project name
   UPDATE projects SET name = 'My Custom Project' WHERE id = '00000000-0000-0000-0000-000000000001';
   ```

## CI/CD Integration

For automated deployments:

1. **Add migration step to CI/CD pipeline**:

   ```yaml
   - name: Run database migrations
     run: |
       supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
       supabase db push
   ```

   This will automatically apply both schema and seed migrations.

2. **Or use SQL execution via API**:
   - Use Supabase Management API to execute SQL
   - Store connection credentials securely in CI/CD secrets
   - Execute migrations in order (000001, then 000002)

## References

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Database Schema Design](./database-schema.md)
