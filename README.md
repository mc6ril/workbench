## Workbench

**Workbench** is a family-centered daily life management app — a personal life OS that brings together multiple domains (project management, meal planning, vacation planning, budget, and more) under a single workspace, with multi-user collaboration and role-based permissions.

### Purpose

Workbench is built around the idea that a household needs a shared space to manage work, plans, and daily life clearly, without cognitive overload.

Each domain is a self-contained "board" experience:
- **Project management** — tickets, epics, sprints, Kanban board
- **Meal planning** — recipe database, weekly menus, shopping lists *(coming)*
- **Vacation planning** — destinations, activities, checklists *(coming)*
- **Budget** — shared expenses, categories, periods *(coming)*

### Core Principles

1. **Family-first**: Multi-user, role-based permissions (`admin`, `member`, `viewer`), collaboration built-in
2. **Domain-driven**: Each life domain is an isolated module with its own business rules
3. **Incremental construction**: One domain at a time, each is independently usable
4. **Clarity over power**: Fewer features, explicit structure, no hidden magic

### Architecture

Workbench now follows a **modular domain architecture**:

- `src/app/` keeps Next.js routing and route composition
- `src/domains/project-management/` owns project-management business logic, domain use cases, infrastructure adapters, and domain presentation
- `src/shared/` owns reusable UI, shared infrastructure clients, i18n, auth, observability, constants, types, utils, and accessibility

Inside each domain module, responsibilities stay layered:

- **Domain**: schemas, rules, constants
- **Usecases**: orchestration
- **Ports**: contracts
- **Infrastructure**: repositories and mappers
- **Presentation**: hooks, stores, pages, layouts, components

Business rules stay inside domain modules, not in route files or shared UI primitives.

### Development Strategy

Each feature is implemented as a complete vertical slice (UI + use case + domain logic + persistence). Features are built in order:

1. Project setup and health check
2. Board (ticket CRUD)
3. Board columns configuration
4. Drag and drop workflow
5. Epics
6. Sub-tasks

No feature is started until the previous one is fully done.

### Testing

- Run unit tests once: `yarn test`
- Run unit tests in watch mode: `yarn test:watch`

Tests live under the project root `__tests__/` directory (mirroring the `src/` structure), with shared mocks under `__mocks__/`. This setup is powered by Jest with TypeScript support (`ts-jest`), following the modular domain testing rules described in `.cursor/docs/testing.md`.

### Success Criteria

Workbench is successful if:

- It replaces ad-hoc notes and mental tracking
- Managing tasks feels calm and predictable
- The system remains understandable after months away
- Every feature has a clear reason to exist
