# Project Overview — Workbench (Personal Jira-like)

## 1. Purpose

**Workbench** is a lightweight, personal task and project management tool inspired by Jira, designed to help a single user manage work **clearly, progressively, and without cognitive overload**.

The goal is **not** to replicate Jira, but to provide:

- a clean backlog,
- a visual board (Trello-like),
- and structured planning via Epics and sub-tasks,

all built **incrementally, Workbench by Workbench**.

---

## 2. Core Principles

1. **Secure and authenticated**
   - Users must be authenticated to access any project
   - Access is restricted to project members only
   - Edit/delete permissions are role-based (admin or member)

2. **Personal-first**
   - Designed for single user or small teams
   - Role-based permissions for collaboration (admin, member, viewer)

3. **Incremental construction**
   - One feature = one vertical slice
   - Each slice is usable on its own

4. **Clarity over power**
   - Fewer features
   - Explicit structure
   - No hidden magic

5. **Domain-driven**
   - Clear concepts
   - Stable domain model
   - UI reflects the domain, not the opposite

---

## 3. Core Features (MVP Scope)

### 3.1 Backlog

The backlog is the foundation of the system.

**Capabilities**

- Create tickets
- Edit title and description
- Delete tickets
- View all tickets in a flat list
- Filter and sort tickets

**Rules**

- Tickets exist independently of the board
- No status logic required to exist in the backlog

---

### 3.2 Board (Trello-like)

The board is a **visual representation** of tickets.

**Capabilities**

- Custom columns (statuses)
- Drag and drop tickets between columns
- Reorder tickets within a column
- Persist ticket position and status

**Rules**

- The board does not create tickets
- Moving a ticket updates its status and position
- Board configuration is fully user-defined

---

### 3.3 Epics

Epics provide long-term structure and grouping.

**Capabilities**

- Create Epics
- Assign tickets to an Epic
- View all tickets linked to an Epic
- Display Epic progress (basic)

**Rules**

- A ticket may belong to at most one Epic
- Epics do not affect ticket workflow directly

---

### 3.4 Sub-tasks

Sub-tasks allow hierarchical decomposition.

**Capabilities**

- Create sub-tasks under a ticket
- View parent/child relationships
- Track completion of sub-tasks

**Rules**

- Sub-tasks are tickets with a parent reference
- Only one level of nesting (no infinite trees)

---

## 4. Security and Access Control

### Authentication

- All users must be authenticated via Supabase Auth to access the application
- Only authenticated users can view or interact with projects

### Project Membership

- Users must be members of a project to access it
- Project membership is managed via the `project_members` table
- Each user has a role in each project: `admin`, `member`, or `viewer`

### Permissions

- **View access**: Users can view projects where they are members (any role)
- **Edit access**: Only users with `admin` or `member` roles can create, update, or delete tickets, epics, boards, and columns
- **Admin access**: Only users with `admin` role can:
  - Delete projects
  - Manage project members (add/remove users, change roles)

See `docs/row-level-security.md` for detailed information about RLS policies and permissions.

## 5. Non-Goals (Explicitly Out of Scope)

- Multi-project management (single project assumption for MVP)
- Notifications
- Comments or mentions
- Time tracking
- Sprint management
- Reports or burndown charts

These may be considered **only after** the core is stable.

---

## 6. Domain Model (Conceptual)

### Entities

- **Project**
- **Ticket**
- **Epic**
- **Board**
- **Column**

### Relationships

- A Project contains many Tickets
- A Ticket may belong to one Epic
- A Ticket may have one parent Ticket
- A Board contains ordered Columns
- Columns reference Tickets by status and position

---

## 7. Architecture

Workbench follows **Clean Architecture** principles.

### Layers

- **Domain**
  - Entities
  - Business rules
- **Application**
  - Use cases
  - Commands and queries
- **Infrastructure**
  - Database
  - Repositories
- **UI**
  - Pages
  - View models

### Guiding Rule

> The domain knows nothing about frameworks, databases, or UI.

---

## 8. Development Strategy

### Vertical Slices

Each feature is implemented as a **complete vertical slice**:

- UI
- Use case
- Domain logic
- Persistence

### Order of Implementation

1. Project setup and health check
2. Backlog (ticket CRUD)
3. Board columns configuration
4. Drag and drop workflow
5. Epics
6. Sub-tasks

No feature is started until the previous one is **fully done**.

---

## 9. Success Criteria

Workbench is successful if:

- It replaces ad-hoc notes and mental tracking
- Managing tasks feels calm and predictable
- The system remains understandable after months away
- Every feature has a clear reason to exist

---

## 10. Long-Term Vision (Optional)

If Workbench grows beyond personal use:

- Multiple projects
- Templates
- Persistence sync
- Collaboration
- Plugin system

But **only** if the personal version remains simple and solid.

---

## 11. One-Sentence Summary

> **Workbench is a personal project management tool built incrementally, where every feature earns its place and nothing exists without purpose.**
