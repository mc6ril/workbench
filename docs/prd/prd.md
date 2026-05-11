# Workbench — Product Requirements Document (PRD)

Status: MVP shipped (baseline documentation).

This PRD is derived **only** from runtime code in `src/` and database migrations in `supabase/migrations/`.

## 1) Product summary

Workbench is a web application for **project task management** centered around a **Kanban-style board of tickets** with collaboration (members, invitations, roles).

### What the product does

- Create and manage **projects**.
- Provide a **board** per project with configurable columns (default workflow states) and **drag & drop**.
- Create, update, move, reorder, and archive **tickets**.
- Collaborate via **members**, **roles**, **invitations**, **assignees**, and **comments**.
- Manage **account** (identity, avatar, preferences)

### What the product does not aim to do (based on current codebase)

- Epics, sprints, and legacy advanced planning entities are intentionally removed (see migrations removing sprint model and legacy epics/labels/subtasks).
- Multi-module ecosystem beyond the board module is not present yet.

## 2) Users and permissions

### Personas

- **Individual**: manages personal projects and tickets.
- **Project admin**: manages membership, invitations, roles, and can delete a project.
- **Team member**: can create and edit tickets (depending on role).
- **Viewer**: read-only access to project content.
- **Subscriber**: pays for higher tiers and feature limits.

### Roles (project-scoped)

Defined in `src/domains/project/core/domain/project.types.ts`:

- `admin`
- `member`
- `viewer`

DB enforcement is aligned with RLS helpers such as `is_project_member`, `is_project_admin`, `can_edit_project` (see `supabase/migrations/000003_add_project_members_and_rls.sql`).

## 3) Core user journeys (MVP)

### Authentication

- Sign up (email/password) with optional email verification.
- Sign in (email/password) + Google OAuth.
- Password reset / update password flows.

### Workspace → Project

- After sign-in, user lands on **workspace** with their accessible projects.
- User can create a project (name + board emoji).
- Selecting/creating a project navigates to `/{projectId}/board`.

### Board usage

- Board loads and ensures a board row exists and default columns exist (todo / in_progress / done).
- User creates tickets, moves/reorders with drag & drop, filters/searches.
- User opens ticket detail route and can comment and assign users (subject to permissions).

### Collaboration

- Admin invites users to a project.
- Invited user accepts via a tokenized join link.

## 4) Functional requirements

### 4.1 Routing and pages (high-level)

Observed route groups and main pages in `src/app/`:

- Public:
  - `/` landing
  - `/legal`
- Auth:
  - `/auth/signup`
  - `/auth/signin`
  - `/auth/reset-password`
  - `/auth/update-password`
  - `/auth/verify-email`
  - `/auth/callback` (OAuth callback exchange)
- Protected:
  - `/workspace`
  - `/{projectId}/board`
  - `/{projectId}/board/tickets/{ticketId}`
  - `/{projectId}/settings`
  - `/account`
- Invitation:
  - `/join/{token}`

### 4.2 Workspace

- List projects (with stats) and last activity subtitle.
- Create project:
  - Name must be non-empty and must **not contain emoji** (validated in usecase).
  - Board emoji must be chosen from an allowed preset set.
- “Reclaimable projects” exist as a concept: user can re-attach themselves to a project (implementation inferred from `useReclaimableProjects` and `useAddUserToProject` usage).

### 4.3 Project settings

- Edit project name and board emoji.
- View role/capabilities, and manage members/invitations based on permissions.
- Delete project (admin-only) with name confirmation.

### 4.4 Board (tickets)

Ticket model (see `src/modules/board/core/domain/ticket.types.ts`):

- Required: `projectId`, `title`, `columnId`
- Optional: `description`, `priority`, `dueDate` (`YYYY-MM-DD`), `storyPoints`, `createdBy`
- System-managed: `position`, `codeNumber` (per-project incremental), `completedAt`, archival fields

Core behaviors:

- Default board/column provisioning on board open (ensures no duplicate default lanes).
- Drag & drop to move and reorder tickets.
- Ticket detail view route with comments and assignees.

### 4.5 Comments

- Comments belong to tickets; access is controlled via ticket’s project membership (RLS).
- There is an RPC `get_ticket_comments(p_ticket_id)` returning author display name and avatar URL (see `supabase/migrations/000020_comments.sql`).

### 4.6 Invitations

- Invitations are token-based with expiry and status.
- Accept/decline implemented as RPCs (see `supabase/migrations/000014_project_invitations.sql`).
- Join route `/join/{token}` enforces sign-in; on success redirects to the project board.

### 4.7 Account

Account settings include:

- Identity updates (display name/email).
- Avatar upload/remove with validation and error mapping.
- Preferences: email notifications, theme (light/dark/system), language (persisted).
- Security: password change when permitted, sign out, account deletion.

## 5) Non-functional requirements

- **Security**: protected routes “fail-closed” (redirect to landing/workspace on errors). Access control relies on RLS and server-side guards.
- **Accessibility**: interactive elements use centralized accessibility IDs.
- **Internationalization**: UI strings use translation keys (`useTranslation`).
- **Performance**: Suspense + loaders; board leverages memoization and optimized hooks for DnD.

## 6) Success metrics (post-MVP)

- Activation: % users creating a project and first ticket.
- Engagement: tickets created/updated per project per week.
- Collaboration: invitations accepted rate; comments per ticket.
- Reliability: rate of access guard redirects and error boundary triggers.

## 7) Open questions / next iterations

- Archival: confirm user-facing archival and weekly archival job UX (there is an API job route for archiving completed tickets).
