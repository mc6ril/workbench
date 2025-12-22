## Workbench

**Workbench** is a lightweight, personal task and project management tool inspired by Jira, designed to help a single user manage work clearly, progressively, and without cognitive overload.

### Purpose

Workbench is **not** meant to replicate Jira, but to provide:

-   A clean backlog for managing tickets
-   A visual board (Trello-like) for workflow visualization
-   Structured planning via Epics and sub-tasks

All built **incrementally, feature by feature**, where each feature is a complete vertical slice that is usable on its own.

### Core Principles

1. **Personal-first**: Single user, no collaboration, no permissions, no accounts (for now)
2. **Incremental construction**: One feature = one vertical slice, each slice is usable independently
3. **Clarity over power**: Fewer features, explicit structure, no hidden magic
4. **Domain-driven**: Clear concepts, stable domain model, UI reflects the domain

### Core Features (MVP Scope)

-   **Backlog**: Create, edit, delete, view, filter, and sort tickets in a flat list
-   **Board**: Custom columns (statuses), drag and drop tickets, reorder within columns, persist position and status
-   **Epics**: Create epics, assign tickets to epics, view epic progress
-   **Sub-tasks**: Create sub-tasks under tickets, view parent/child relationships, track completion

### Architecture

Workbench follows **Clean Architecture** principles with clear separation between:

-   **Domain**: Entities and business rules
-   **Application**: Use cases, commands and queries
-   **Infrastructure**: Database and repositories
-   **UI**: Pages and view models

The domain knows nothing about frameworks, databases, or UI.

### Development Strategy

Each feature is implemented as a complete vertical slice (UI + use case + domain logic + persistence). Features are built in order:

1. Project setup and health check
2. Backlog (ticket CRUD)
3. Board columns configuration
4. Drag and drop workflow
5. Epics
6. Sub-tasks

No feature is started until the previous one is fully done.

### Success Criteria

Workbench is successful if:

-   It replaces ad-hoc notes and mental tracking
-   Managing tasks feels calm and predictable
-   The system remains understandable after months away
-   Every feature has a clear reason to exist
