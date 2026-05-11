# Workbench — Architecture (current, code-derived)

This document is derived **only** from `src/` and `supabase/migrations/`. It intentionally avoids any pre-existing documentation.

## 1) Top-level structure

Workbench follows a domain + module architecture:

- **Routes**: `src/app/` (Next.js App Router)
- **Stable domains**: `src/domains/*` (auth, session, profile, viewer, workspace, project, settings)
- **Project-scoped modules**: `src/modules/*` (currently `board`)
- **Cross-cutting**: `src/shared/*` (design system, i18n, a11y, infra clients, errors, utilities)
- **Database**: `supabase/migrations/*` (schema + RLS + RPCs)

## 2) Layering and dependency direction

Typical dependency flow:
`src/app/* (routing/layout guards)`
→ `domains/*/presentation/*` and `modules/*/presentation/*` (UI composition, hooks, stores)
→ `*/core/usecases/*` (orchestration + validation)
→ `*/core/ports/*` (interfaces/contracts)
→ `*/infrastructure/*` (Supabase adapters, server helpers)
→ `src/shared/infrastructure/*` (shared clients)
→ Supabase.

Key rules observed:

- Usecases validate input (Zod) and delegate to ports/gateways.
- UI performs data fetching via React Query hooks that call usecases.
- Protected route groups enforce session and project access server-side (fail-closed).

## 3) Runtime “request flow” (high-level)

### 3.1 Authentication guard for protected routes

`src/app/(auth)/layout.tsx`:

- Creates a Supabase server client with cookies.
- Loads current session via a session usecase.
- On error or missing session, redirects to `/` (landing).

### 3.2 Project access guard for project-scoped routes

`src/app/(auth)/[projectId]/layout.tsx`:

- Runs a server-side project access check for `projectId`.
- Relies on RLS and a server helper (`getProjectForRoute`).
- On any error, redirects to `/workspace` (fail-closed for security).
- Does not pass project data to children; client pages fetch via React Query.

### 3.3 Client pages

Client pages live under domain/module presentation:

- Workspace UI: `src/domains/workspace/presentation/pages/workspace`
- Project settings UI: `src/domains/project/presentation/pages/settings/ProjectSettingsPage.tsx`
- Board UI: `src/modules/board/presentation/pages/board`
- Ticket detail UI: `src/modules/board/presentation/pages/ticket`
- Account UI: `src/domains/settings/presentation/pages/account`
- Auth pages: `src/domains/auth/presentation/pages/*`

## 4) Domain and module responsibilities

### 4.1 `auth` domain

Scope:

- Sign up / sign in / sign out.
- Email verification and password reset/update.
- Google OAuth sign-in.

Implementation signals:

- UI forms use Zod schemas and React Hook Form.
- Errors mapped via centralized app error codes.

### 4.2 `session` domain

Scope:

- Loading current session (server-guard + client hooks).
- Capability checks (e.g., can update password).

### 4.3 `viewer` domain

Scope:

- Build a “current viewer” read model (display name, login email).
- Used by workspace/account and other pages for personalized UI.

### 4.4 `profile` domain

Scope:

- User profile data + preferences (theme, language, email notifications).
- Avatar storage integration (validation + upload/remove).
- Onboarding/getting-started status signals for board usage.

### 4.5 `workspace` domain

Scope:

- Project catalog for current user: list projects (with stats), last activity.
- “Has access to any project” check (optimized boolean).
- Reclaimable projects (re-attaching access).

### 4.6 `project` domain

Scope:

- Project entity lifecycle: create/update/get/delete.
- Membership and roles: list members, update role, remove member.
- Invitations: invite, list, revoke, accept/decline/join via token.
- Permissions provider used by presentation to derive capabilities.

### 4.7 `settings` domain

Scope:

- Account identity updates (email/display name) from an account screen.

### 4.8 `board` module

Scope:

- Board configuration and columns (default provisioning, configuration updates).
- Ticket lifecycle: create/update/delete, move/reorder, completion logic, archival.
- Ticket assignees: assign/unassign and project-wide assignee lookups.
- Comments: create/list/update/delete, plus onboarding signals.

Board workflow model:

- Columns have a stable `state` (`todo` / `in_progress` / `done`).
- Tickets point to a `columnId` and have a sortable `position`.
- Completion time (`completedAt`) is derived based on “done” transitions.
- Archival fields exist (`archivedAt`, `archivedWeekStart`) with a weekly archival job route.

## 5) Database (Supabase) architecture

### 5.1 Tables (conceptual)

From migrations and domain types:

- `projects`
- `project_members` (user ↔ project relationship with role)
- `project_invitations` (token invitations, status, expiry)
- `boards` (one per project)
- `columns` (lanes; now expressed with workflow state + key in newer schema)
- `tickets` (with extended fields, column relationship, search optimizations, archival fields)
- `ticket_assignees` (assignment join table, added in later migrations)
- `comments`
- `user_profiles` (single source of truth)

### 5.2 Row Level Security (RLS)

RLS is enabled broadly; access is constrained to project membership:

- Helpers: `is_project_member(project_uuid)`, `is_project_admin(project_uuid)`, `can_edit_project(project_uuid)`.
- Tickets: select for members; insert/update/delete for editors (admin/member).
- Members and invitations: admin-only mutations.
- Comments: select for members; create for editors; update for author; delete for author or project admin.

### 5.3 RPCs (examples visible in migrations)

- Invitations: accept/decline/list pending invitations.
- Comments: `get_ticket_comments(ticket_id)` returning author profile information.
  There are additional RPCs for ticket assignees and board operations in later migrations.

## 6) Cross-cutting concerns

### 6.1 i18n

- `src/shared/i18n/*`: translation keys, request locale, and runtime message resolution.
- Metadata is derived from translations at runtime (app title/description).

### 6.2 Accessibility

- `src/shared/a11y/*`: centralized accessibility IDs used in UI.

### 6.3 Design system

- `src/shared/design-system/*`: reusable UI primitives used by domain/module pages.

### 6.4 Error strategy

- Domain and infra errors mapped to app-level error codes (`src/shared/errors/*`).
- UI displays translated error messages using error translators.

## 7) Operational endpoints (Next.js API routes)

From `src/app/api/*`:

- Auth: delete user.
- Jobs: archive completed tickets batch.
