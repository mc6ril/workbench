# Modular Domain Architecture

## Fundamental Principles

This project now follows a **modular domain architecture**.

The application is organized around business domains. Each domain owns its own:

- `core/` for business rules and contracts
- `infrastructure/` for technical adapters
- `presentation/` for UI-facing domain code

Cross-cutting concerns live in `src/shared/`.

### Golden Rule

**Business logic belongs inside a domain module, never in `src/app/`, never in shared UI primitives, and never directly in infrastructure clients.**

## Source Structure

```text
src/
  app/                                  # Next.js routing and route composition
  domains/
    project-management/
      core/
        domain/
          schema/                       # ticket.schema.ts, board.schema.ts, ...
          rules/                        # ticket.rules.ts, board.rules.ts, ...
          constants/
        ports/                          # ticketRepository.ts, boardRepository.ts, ...
        usecases/                       # createTicket.ts, listTickets.ts, ...
      infrastructure/
        supabase/                       # repositories, mappers, adapters
      presentation/
        components/                     # ticket/, board/, epic/, sprint/, ...
        hooks/                          # useTickets, useCreateTicket, ...
        stores/                         # useBoardStore, useFilterStore, ...
        pages/                          # BoardPage, EpicsPage, ...
        layouts/                        # ProjectShell, SettingsLayout, ...
        navigation/                     # projectViews.config.ts
  shared/
    design-system/
      ui/                               # Button, Modal, Toast, ...
    i18n/
    observability/
    auth/
    infrastructure/
      supabase/                         # client-browser.ts, client-server.ts, client-admin.ts
      stripe/
      web/
    constants/
    types/
    utils/
    a11y/
  styles/
  middleware.ts
```

## Layer Responsibilities

### 1. `src/app/`

- Owns Next.js routing only
- Composes domain pages and layouts
- Does not contain business rules
- Does not call Supabase directly

### 2. `src/domains/<domain>/core/domain`

- Owns schemas, rules, and domain constants
- Pure business logic only
- No React, Next.js, Zustand, React Query, or Supabase imports

### 3. `src/domains/<domain>/core/ports`

- Owns domain contracts
- Defines repository and gateway interfaces used by use cases
- No implementation logic

### 4. `src/domains/<domain>/core/usecases`

- Orchestrates business flows for that domain
- Depends on the domain's rules, schemas, and ports
- Returns domain-shaped data
- Never imports UI frameworks or Supabase clients directly

### 5. `src/domains/<domain>/infrastructure`

- Implements ports for one domain
- Contains Supabase repositories, mappers, and adapters
- Can consume shared infrastructure clients from `src/shared/infrastructure/*`
- Must not import another domain's presentation layer

### 6. `src/domains/<domain>/presentation`

- Owns domain-specific UI composition
- `components/` for domain UI pieces
- `hooks/` for React Query hooks and UI orchestration
- `stores/` for domain UI state only
- `pages/` and `layouts/` for route-level composition reused by `src/app`
- `navigation/` for domain view configuration

### 7. `src/shared/`

- Holds cross-cutting, reusable building blocks
- `shared/design-system/ui/` contains reusable UI primitives only
- `shared/infrastructure/` contains technical clients shared across domains
- `shared/a11y/`, `shared/i18n/`, `shared/utils/`, `shared/types/` stay domain-agnostic
- Shared code must not absorb ticket, board, epic, sprint, or other domain-specific business rules

## Dependency Direction

Within one domain, dependencies should flow like this:

```text
src/app route
  -> domains/<domain>/presentation/pages or layouts
  -> domains/<domain>/presentation/hooks
  -> domains/<domain>/core/usecases
  -> domains/<domain>/core/ports
  -> domains/<domain>/infrastructure/*
  -> shared/infrastructure/*
  -> external service
```

## Cursor Rules

### Cursor must

1. Create new business code inside the correct domain module.
2. Keep reusable UI in `src/shared/design-system/ui/`.
3. Keep cross-cutting utilities in `src/shared/`.
4. Keep `src/app/` thin and route-focused.
5. Use domain hooks to connect UI to domain use cases.
6. Use shared infrastructure clients from `src/shared/infrastructure/*` rather than recreating them in each feature.

### Cursor must never

1. Recreate a global `src/core/`, `src/presentation/`, or `src/infrastructure/` root.
2. Put ticket, board, epic, sprint, or project-management logic in `src/shared/`.
3. Put reusable UI primitives in a domain module when they belong in `src/shared/design-system/ui/`.
4. Call Supabase directly from `src/app/` routes or domain page components.
5. Import one domain's infrastructure or presentation code directly into another domain's presentation layer.

## Example Flow

```text
src/app/[projectId]/board/page.tsx
  -> domains/project-management/presentation/pages/BoardPage
  -> domains/project-management/presentation/hooks/useTickets
  -> domains/project-management/core/usecases/listTickets
  -> domains/project-management/core/ports/ticketRepository
  -> domains/project-management/infrastructure/supabase/ticketRepository.supabase
  -> shared/infrastructure/supabase/client-browser
  -> Supabase
```

## Key Takeaway

The architecture is no longer organized by a single global set of layers. It is now organized by **domains first**, with **layered internals inside each domain**, and **shared cross-cutting services** in `src/shared/`.
