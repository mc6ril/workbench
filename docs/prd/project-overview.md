# Workbench — Project overview (for new contributors)

This document explains the project to someone who has never seen the codebase. It is derived **only** from `src/` and `supabase/` (migrations and policies).

## What is Workbench?

Workbench is a web app for managing projects through a **Kanban board**. Each project has:

- a **board** with columns (workflow lanes),
- **tickets** that move across columns,
- collaboration features (members, invitations, roles, comments, assignees),
- optional **paid plans** via Stripe subscriptions.

Think: “a lightweight Jira/Trello-style board per project”, with strong database-level access control (RLS).

## What can a user do?

### Authentication

Users can:

- sign up with email/password,
- sign in with email/password,
- sign in with Google OAuth (when supported),
- reset or update password,
- verify email (depending on configuration).

### Workspace

After sign-in, users access the **workspace** area to:

- list projects they can access,
- create a new project (project name + a board emoji),
- potentially reclaim access to projects (when applicable).

Creating a project navigates the user to the project board route `/{projectId}/board`.

### Project board (Kanban)

Inside a project, users can:

- view columns (default workflow lanes exist even for new projects),
- create tickets,
- move and reorder tickets via drag & drop,
- filter and search tickets,
- open a ticket detail page.

Tickets have common agile fields:

- title (required),
- description (optional),
- priority,
- due date (calendar date string),
- story points,
- assignees,
- comments.

Tickets also have a project-scoped **code number** (incremental identifier inside the project) and support completion and archival timestamps.

### Project settings and collaboration

Project settings include:

- project metadata (name and board emoji),
- membership management (list members, remove members, update roles),
- invitation management (create/revoke invitations),
- deletion (admin-only) with an explicit confirmation step.

Invitations are token-based links. A user can join using `/join/{token}`, which enforces authentication before accepting the invitation.

### Account settings

Users can manage:

- display name and login email,
- avatar upload/remove,
- preferences (language, theme, email notifications),
- security actions (password change when allowed, sign out, delete account),
- subscription and billing actions (when billing is enabled).

### Billing (optional)

Workbench supports paid plans with Stripe:

- `/pricing` shows plan cards and triggers checkout or billing portal actions,
- subscription entitlements can gate features and/or enforce limits.

## How the codebase is organized

### Routes (`src/app/`)

All Next.js routes live here. The codebase uses route groups:

- public routes (landing and static pages),
- auth routes (signup/signin/reset/update/verify/callback),
- protected routes (workspace, project board, project settings, account),
- API routes for Stripe, auth deletion, and background jobs.

Protected route groups use server-side layouts to enforce:

- authenticated session,
- project access (via RLS-protected lookups).

### Domains (`src/domains/*`)

Domains contain stable business capabilities:

- `auth`: sign-up/sign-in/sign-out, verification, password flows, OAuth
- `session`: session loading and auth capability checks
- `viewer`: “current user” read model used by UI
- `profile`: user profile, avatar, preferences, onboarding signals
- `workspace`: project catalog and workspace-level behaviors
- `project`: project entity + membership + roles + invitations + permissions
- `settings`: account identity updates (email/display name)
- `billing`: subscriptions, entitlements, Stripe integration, billing visibility

Within a domain:

- `core/usecases/*` orchestrate business flows and validate inputs (Zod).
- `core/ports/*` define interfaces used by usecases.
- `infrastructure/*` provides Supabase-backed implementations.
- `presentation/*` provides UI components, pages, hooks, and UI stores.

### Modules (`src/modules/*`)

Modules are project-scoped, pluggable capabilities.

Current module:

- `board`: board configuration, columns, tickets, drag & drop, comments, assignees, and related flows.

### Shared (`src/shared/*`)

Cross-cutting code:

- design system components,
- i18n utilities and translation lookups,
- accessibility ID helpers,
- shared infrastructure clients (Supabase),
- error mapping and utilities.

## Database and security model (Supabase)

### Key tables (conceptual)

From migrations and domain types, the core entities are:

- projects
- project_members (role: admin/member/viewer)
- project_invitations (token-based)
- boards and columns
- tickets (including extended fields and archival)
- ticket assignees (join table)
- comments
- user profiles
- subscriptions (Stripe)

### RLS-first access control

Supabase Row Level Security (RLS) is central:

- membership determines what a user can read,
- editor roles determine what a user can create/update/delete,
- admin role is required for member management and project deletion,
- subscription rows are readable only by the owning user.

If you are debugging “access denied” behavior, start by checking:

- whether the user is in `project_members` for the project,
- whether their role satisfies `can_edit_project(...)`,
- whether the UI is calling a usecase that maps to an RLS-protected table/RPC.

## Practical “first steps” for a new engineer

1. Start at `src/app/` to understand routes and server-side guards.
2. Read the main pages:
   - workspace page (project list and create project),
   - board page (DnD, filters, create ticket),
   - ticket detail view (comments/assignees),
   - project settings page (members/invitations/deletion),
   - account page (profile/preferences/security/billing).
3. Trace each feature through: presentation hook → usecase → port → Supabase adapter.
4. Use `supabase/migrations/` to understand the authoritative data model, RLS policies, and RPCs.
