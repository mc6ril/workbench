# Database Schema Design

This document describes the database schema for Workbench, including tables, relationships, constraints, and design decisions.

## Overview

The Workbench database schema supports a single-user task management system with the following core entities:

- **Project**: Container for all work items (single project assumption for MVP)
- **Ticket**: Individual work items that can be organized in a backlog or board
- **Epic**: Grouping mechanism for related tickets
- **Board**: Visual representation configuration for tickets
- **Column**: Status columns within a board

## Entity Relationship Summary

```
Project (1) ──< (many) Ticket
Project (1) ──< (many) Epic
Project (1) ──< (1) Board
Board (1) ──< (many) Column
Epic (1) ──< (many) Ticket [optional, via epic_id]
Ticket (1) ──< (many) Ticket [optional, via parent_id, single-level only]
```

## Tables

### project_members

The project_members table links users to projects with specific roles for access control.

| Column     | Type        | Constraints                     | Description                      |
| ---------- | ----------- | ------------------------------- | -------------------------------- |
| id         | uuid        | PRIMARY KEY, NOT NULL           | Unique identifier                |
| project_id | uuid        | FOREIGN KEY, NOT NULL           | Reference to projects.id         |
| user_id    | uuid        | FOREIGN KEY, NOT NULL           | Reference to auth.users.id       |
| role       | text        | NOT NULL, CHECK (role IN (...)) | User role: admin, member, viewer |
| created_at | timestamptz | NOT NULL, DEFAULT now           | Creation timestamp               |
| updated_at | timestamptz | NOT NULL, DEFAULT now           | Last update timestamp            |

**Foreign Keys:**

- `project_id` → `projects.id` (ON DELETE CASCADE)
- `user_id` → `auth.users.id` (ON DELETE CASCADE)

**Unique Constraints:**

- `(project_id, user_id)` UNIQUE: Each user can only have one role per project

**Check Constraints:**

- `role IN ('admin', 'member', 'viewer')`: Role must be one of the valid values

**Indexes:**

- Primary key index on `id` (automatic)
- Index on `project_id` (for filtering by project)
- Index on `user_id` (for filtering by user)
- Composite index on `(project_id, user_id)` (for membership lookups)

**Notes:**

- See `docs/row-level-security.md` for RLS policies and permission details
- Only admins can manage project members (enforced by RLS)

---

### projects

The projects table stores project information. For the MVP, we assume a single project, but the schema supports multiple projects for future extensibility.

| Column     | Type        | Constraints           | Description           |
| ---------- | ----------- | --------------------- | --------------------- |
| id         | uuid        | PRIMARY KEY, NOT NULL | Unique identifier     |
| name       | text        | NOT NULL              | Project name          |
| created_at | timestamptz | NOT NULL, DEFAULT now | Creation timestamp    |
| updated_at | timestamptz | NOT NULL, DEFAULT now | Last update timestamp |

**Indexes:**

- Primary key index on `id` (automatic)

**Notes:**

- For MVP, we'll seed a single default project
- Multiple projects support can be added later without schema changes

---

### tickets

The tickets table stores all work items (both regular tickets and sub-tasks).

| Column      | Type        | Constraints                                | Description                                      |
| ----------- | ----------- | ------------------------------------------ | ------------------------------------------------ |
| id          | uuid        | PRIMARY KEY, NOT NULL                      | Unique identifier                                |
| project_id  | uuid        | FOREIGN KEY, NOT NULL                      | Reference to projects.id                         |
| title       | text        | NOT NULL, CHECK (length > 0)               | Ticket title (required, non-empty)               |
| description | text        |                                            | Optional ticket description                      |
| status      | text        | NOT NULL                                   | Ticket status (references columns.status)        |
| position    | integer     | NOT NULL, CHECK (position >= 0), DEFAULT 0 | Position within status/column                    |
| epic_id     | uuid        | FOREIGN KEY                                | Optional reference to epics.id                   |
| parent_id   | uuid        | FOREIGN KEY                                | Optional reference to tickets.id (for sub-tasks) |
| created_at  | timestamptz | NOT NULL, DEFAULT now                      | Creation timestamp                               |
| updated_at  | timestamptz | NOT NULL, DEFAULT now                      | Last update timestamp                            |

**Foreign Keys:**

- `project_id` → `projects.id` (ON DELETE CASCADE)
- `epic_id` → `epics.id` (ON DELETE SET NULL)
- `parent_id` → `tickets.id` (ON DELETE CASCADE)

**Indexes:**

- Primary key index on `id` (automatic)
- Index on `project_id` (for filtering by project)
- Index on `status` (for board column queries)
- Index on `position` (for ordering within columns)
- Index on `epic_id` (for epic ticket queries)
- Index on `parent_id` (for sub-task queries)
- Composite index on `(project_id, status, position)` (for board queries)

**Unique Constraints:**

- None (multiple tickets can have the same position in different statuses)

**Check Constraints:**

- `position >= 0`: Position must be non-negative
- `length(title) > 0`: Title must be non-empty (handled in application layer or trigger)

**Business Rules:**

- A ticket can belong to at most one epic (`epic_id` is nullable, single value)
- A ticket can have at most one parent (`parent_id` is nullable, single value)
- Sub-tasks (tickets with `parent_id`) cannot have sub-tasks themselves (enforced in application layer)
- Status must correspond to a valid column status in the board (enforced in application layer)

---

### epics

The epics table stores epic (feature group) information.

| Column      | Type        | Constraints                  | Description                     |
| ----------- | ----------- | ---------------------------- | ------------------------------- |
| id          | uuid        | PRIMARY KEY, NOT NULL        | Unique identifier               |
| project_id  | uuid        | FOREIGN KEY, NOT NULL        | Reference to projects.id        |
| name        | text        | NOT NULL, CHECK (length > 0) | Epic name (required, non-empty) |
| description | text        |                              | Optional epic description       |
| created_at  | timestamptz | NOT NULL, DEFAULT now        | Creation timestamp              |
| updated_at  | timestamptz | NOT NULL, DEFAULT now        | Last update timestamp           |

**Foreign Keys:**

- `project_id` → `projects.id` (ON DELETE CASCADE)

**Indexes:**

- Primary key index on `id` (automatic)
- Index on `project_id` (for filtering by project)

**Check Constraints:**

- `length(name) > 0`: Name must be non-empty (handled in application layer or trigger)

**Notes:**

- Epics are scoped to a project
- Epic progress is calculated dynamically from linked tickets (no stored field)

---

### boards

The boards table stores board configuration. Each project has one board.

| Column     | Type        | Constraints                   | Description                                      |
| ---------- | ----------- | ----------------------------- | ------------------------------------------------ |
| id         | uuid        | PRIMARY KEY, NOT NULL         | Unique identifier                                |
| project_id | uuid        | FOREIGN KEY, NOT NULL, UNIQUE | Reference to projects.id (one board per project) |
| created_at | timestamptz | NOT NULL, DEFAULT now         | Creation timestamp                               |
| updated_at | timestamptz | NOT NULL, DEFAULT now         | Last update timestamp                            |

**Foreign Keys:**

- `project_id` → `projects.id` (ON DELETE CASCADE)

**Unique Constraints:**

- `project_id` UNIQUE: One board per project (enforced at database level)

**Indexes:**

- Primary key index on `id` (automatic)
- Unique index on `project_id` (automatic from UNIQUE constraint)

**Notes:**

- Board configuration is defined through its columns
- MVP assumes one board per project

---

### columns

The columns table stores board column (status) definitions.

| Column     | Type        | Constraints                                | Description                                |
| ---------- | ----------- | ------------------------------------------ | ------------------------------------------ |
| id         | uuid        | PRIMARY KEY, NOT NULL                      | Unique identifier                          |
| board_id   | uuid        | FOREIGN KEY, NOT NULL                      | Reference to boards.id                     |
| name       | text        | NOT NULL, CHECK (length > 0)               | Column display name                        |
| status     | text        | NOT NULL                                   | Status identifier (used in tickets.status) |
| position   | integer     | NOT NULL, CHECK (position >= 0), DEFAULT 0 | Column order within board                  |
| created_at | timestamptz | NOT NULL, DEFAULT now                      | Creation timestamp                         |
| updated_at | timestamptz | NOT NULL, DEFAULT now                      | Last update timestamp                      |

**Foreign Keys:**

- `board_id` → `boards.id` (ON DELETE CASCADE)

**Unique Constraints:**

- `(board_id, status) UNIQUE`: Each status identifier is unique per board
- `(board_id, position) UNIQUE`: Each position is unique per board (ensures ordered columns)

**Indexes:**

- Primary key index on `id` (automatic)
- Index on `board_id` (for board column queries)
- Unique index on `(board_id, status)` (automatic from UNIQUE constraint)
- Unique index on `(board_id, position)` (automatic from UNIQUE constraint)
- Index on `position` (for ordering queries)

**Check Constraints:**

- `position >= 0`: Position must be non-negative
- `length(name) > 0`: Name must be non-empty (handled in application layer or trigger)

**Notes:**

- Status values in `tickets.status` must match a `status` value in `columns` for the project's board
- Columns are ordered by `position`
- Column `status` is used as the value stored in `tickets.status`

---

## Relationships

### One-to-Many Relationships

1. **Project → Tickets**: A project contains many tickets
   - Foreign key: `tickets.project_id` → `projects.id`
   - Cascade delete: Deleting a project deletes all its tickets

2. **Project → Epics**: A project contains many epics
   - Foreign key: `epics.project_id` → `projects.id`
   - Cascade delete: Deleting a project deletes all its epics

3. **Project → Board**: A project has one board (1:1, but stored as FK)
   - Foreign key: `boards.project_id` → `projects.id`
   - Unique constraint: `boards.project_id` UNIQUE
   - Cascade delete: Deleting a project deletes its board

4. **Board → Columns**: A board contains many columns
   - Foreign key: `columns.board_id` → `boards.id`
   - Cascade delete: Deleting a board deletes all its columns

5. **Epic → Tickets**: An epic can contain many tickets (optional)
   - Foreign key: `tickets.epic_id` → `epics.id`
   - Nullable: Tickets don't require an epic
   - Set null on delete: Deleting an epic unassigns tickets (doesn't delete them)

6. **Ticket → Sub-tasks**: A ticket can have many sub-tasks (optional, single-level)
   - Foreign key: `tickets.parent_id` → `tickets.id` (self-referential)
   - Nullable: Regular tickets don't have a parent
   - Cascade delete: Deleting a ticket deletes all its sub-tasks
   - **Business Rule**: Sub-tasks cannot have sub-tasks (enforced in application layer)

---

## Design Decisions

### UUIDs as Primary Keys

- **Decision**: Use `uuid` type for all primary keys
- **Rationale**:
  - Better for distributed systems (if we scale later)
  - No sequential ID exposure in URLs
  - Supabase/PostgreSQL has excellent UUID support

### Timestamps

- **Decision**: Use `timestamptz` (timestamp with timezone) for all timestamp fields
- **Rationale**: Ensures consistent time handling across timezones

### Position Management

- **Decision**: Store position as integer in both `tickets` and `columns`
- **Rationale**:
  - Simple ordering mechanism
  - Allows gaps for efficient reordering
  - Position gaps can be compacted periodically if needed

### Status Storage

- **Decision**: Store status as text in `tickets.status`, matching `columns.status`
- **Rationale**:
  - Flexible: columns can be renamed without changing ticket status values
  - Status values must match existing column status (enforced in application layer)
  - Enables queries filtering by status

### Single-Level Sub-tasks

- **Decision**: Support only single-level nesting via `parent_id` (no grandparent)
- **Rationale**:
  - Simpler mental model
  - Easier to display and manage
  - MVP requirement: "Only one level of nesting"
  - Enforced in application layer (repositories/usecases)

### One Board Per Project

- **Decision**: Enforce one board per project via UNIQUE constraint
- **Rationale**:
  - MVP requirement: single project assumption
  - Simpler initial implementation
  - Can be extended later if needed

### Cascade Deletes

- **Decision**: Use CASCADE for project/board/ticket hierarchies, SET NULL for epic relationships
- **Rationale**:
  - Project deletion should clean up all related data
  - Epic deletion should not delete tickets (just unassign them)
  - Board deletion should clean up columns
  - Ticket deletion should clean up sub-tasks

---

## Constraints Summary

### Foreign Key Constraints

- `tickets.project_id` → `projects.id` (CASCADE)
- `tickets.epic_id` → `epics.id` (SET NULL)
- `tickets.parent_id` → `tickets.id` (CASCADE)
- `epics.project_id` → `projects.id` (CASCADE)
- `boards.project_id` → `projects.id` (CASCADE, UNIQUE)
- `columns.board_id` → `boards.id` (CASCADE)

### Unique Constraints

- `boards.project_id` UNIQUE (one board per project)
- `columns(board_id, status)` UNIQUE (unique status per board)
- `columns(board_id, position)` UNIQUE (unique position per board)

### Check Constraints

- `tickets.position >= 0`
- `columns.position >= 0`
- `length(title) > 0` (tickets, enforced in application layer)
- `length(name) > 0` (epics, columns, enforced in application layer)

### Not Null Constraints

All primary keys, foreign keys, and essential fields are NOT NULL.

---

## Indexes Summary

### Primary Key Indexes (automatic)

- All tables have primary key indexes on `id`

### Foreign Key Indexes

- `tickets.project_id`
- `tickets.epic_id`
- `tickets.parent_id`
- `epics.project_id`
- `boards.project_id`
- `columns.board_id`

### Query Optimization Indexes

- `tickets.status` (for board column filtering)
- `tickets.position` (for ordering)
- `columns.position` (for ordering)
- `tickets(project_id, status, position)` (composite index for board queries)

---

## Data Integrity Rules

### Application-Level Enforcement

The following rules are enforced in application logic (usecases/repositories) rather than database constraints:

1. **Status Validation**: `tickets.status` must match a `columns.status` for the project's board
2. **Single-Level Nesting**: Tickets with `parent_id` cannot have sub-tasks
3. **Non-Empty Strings**: Title, name fields must be non-empty (can use CHECK constraints or application validation)
4. **Position Uniqueness**: Position uniqueness per status/board is managed in application layer for flexibility

### Database-Level Enforcement

- Foreign key relationships
- Primary key uniqueness
- Unique constraints (project_id on boards, status/position on columns)
- NOT NULL constraints on required fields
- Check constraints on position values

---

## Project Members and Permissions

The `project_members` table manages user access to projects with role-based permissions:

- **admin**: Full access, can delete projects, manage members
- **member**: Can edit project data (create/update/delete tickets, epics, etc.)
- **viewer**: Read-only access

See `docs/row-level-security.md` for detailed information about RLS policies and permissions.

## Future Extensibility

The schema is designed to support future enhancements:

1. **Multiple Projects**: Schema already supports multiple projects with user access control
2. **User/Authentication**: Implemented via `project_members` table with role-based permissions
3. **Comments**: Can add `comments` table with foreign key to tickets
4. **History/Audit Log**: Can add `audit_logs` table
5. **Custom Fields**: Can extend tickets table with additional columns or use JSONB for flexible fields
6. **Multi-Level Nesting**: Can add depth tracking if needed later (currently single-level only)
7. **Team/Organization Management**: Can add organizations table and link projects to organizations

---

## Seed Data Considerations

For initial setup, seed data should include:

1. **Default Project**: One project (e.g., "My Workbench")
2. **Default Board**: One board linked to the default project
3. **Default Columns**: Basic columns (e.g., "To Do", "In Progress", "Done") with appropriate status values and positions

See Sub-Ticket 15.4 for seed data implementation details.

---

## Migration Notes

This schema will be implemented via database migrations (Sub-Ticket 15.3). The migration should:

1. Create all tables in dependency order (projects → boards/epics → columns/tickets)
2. Add all foreign key constraints
3. Add all unique constraints
4. Add all check constraints
5. Create all indexes
6. Set up triggers for `updated_at` timestamps (if using triggers, otherwise handled in application)

---

## Schema Validation Checklist

Before implementing migrations, verify:

- [x] All entities from domain model are represented
- [x] All relationships match domain model requirements
- [x] Business rules are enforced (database or application level)
- [x] Indexes support expected query patterns
- [x] Foreign key cascade behaviors are appropriate
- [x] Constraints prevent invalid data states
- [x] Schema supports MVP requirements
- [x] Schema allows future extensibility
