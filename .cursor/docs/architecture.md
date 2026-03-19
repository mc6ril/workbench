# Final Domain + Module Architecture

## Intent

Workbench follows a **domain + module architecture**.

The product is split between:

- **domains**: stable business capabilities that exist outside a specific project module
- **modules**: pluggable project-scoped capabilities enabled inside a project
- **shared**: cross-cutting technical and UI assets

`src/app/` remains the Next.js routing and composition layer only.

## Target Structure

```text
src/
  app/                          # Next.js routing only
  domains/
    auth/                       # account lifecycle: sign in/up, verify email, reset password, update profile, delete account
    billing/                    # plans, subscriptions, Stripe checkout/portal/webhooks
    workspace/                  # workspace dashboard: list/create/join projects
    project/                    # project container: settings, members, invitations, enabled modules
  modules/
    board/                      # tickets, epics, sprints, labels, board views
    recipes/                    # future project module
    vacation/                   # future project module
    budget/                     # future project module
  shared/
    design-system/              # UI primitives and shared UI helpers
    i18n/                       # translations and i18n hooks
    observability/              # logging, tracing, performance tracking
    infrastructure/
      supabase/                 # browser/server/admin clients
      stripe/                   # stripeClient
      web/                      # rateLimit, CSRF
    constants/                  # routes, error codes, feature flags
    types/                      # truly generic types only
    utils/                      # pure domain-free helpers
    a11y/                       # accessibility helpers and constants
  styles/
  middleware.ts
```

## Ownership Model

### `src/app/`

- Owns URL structure, route groups, `page.tsx`, `layout.tsx`, route handlers, and top-level composition.
- Must stay thin.
- Delegates rendering to domains or modules.

### `src/domains/auth/`

- Owns account lifecycle and identity flows.
- Examples: sign in, sign up, OAuth callback, password reset, email verification, account preferences, delete account.

### `src/domains/billing/`

- Owns plans, subscriptions, entitlements, Stripe checkout, portal, and webhooks.

### `src/domains/workspace/`

- Owns the workspace entry experience.
- Examples: list projects, create a project, join a project, choose where to go next.

### `src/domains/project/`

- Owns the **project container**.
- Examples: project settings, members, invitations, roles, project access, enabled modules.
- This is the place where the product decides which modules are active inside a project.

### `src/modules/board/`

- Owns the current Trello/Jira-like project module.
- Examples: tickets, epics, sprints, labels, board views, board-specific hooks and repositories.

### Future modules

- `src/modules/recipes/`
- `src/modules/vacation/`
- `src/modules/budget/`

Their UI shape may differ completely (board, timeline, calendar, list, mixed), but the ownership rule stays the same: if it is a project-scoped capability, it belongs to a module.

## Internal Layering Inside a Domain or Module

Each domain or module can own some or all of these folders:

```text
src/domains/<domain>/
src/modules/<module>/
  core/
    domain/
      schema/
      rules/
      constants/
    ports/
    usecases/
  infrastructure/
  presentation/
    components/
    hooks/
    stores/
    pages/
    layouts/
    navigation/
    providers/
```

### `core/domain`

- Pure business schemas, rules, and constants.
- No React, Next.js, Zustand, React Query, Supabase, or Stripe imports.

### `core/ports`

- Contracts owned by the domain or module.
- Repository and gateway interfaces used by use cases.

### `core/usecases`

- Orchestration and business flows.
- Depends on domain/module rules, schemas, and ports.
- Never imports framework or low-level client code directly.

### `infrastructure`

- Adapters owned by the domain or module.
- Implements ports using shared technical clients when needed.

### `presentation`

- Route-level and UI-level composition owned by the domain or module.
- Components, hooks, stores, pages, layouts, navigation, and providers.

## Shared Layer Rules

`src/shared/` is for cross-cutting code only.

### `src/shared/design-system/`

- Reusable UI primitives only.
- May co-locate internal shared helpers with the primitive when still cross-cutting.
- Never embed project, auth, billing, or board business rules.

### `src/shared/infrastructure/`

- Technical clients and adapters that are not business-owned.
- Browser/server/admin Supabase clients.
- Low-level Stripe client.
- Shared web concerns like CSRF and rate limiting.

### `src/shared/types/`

- Only truly generic types.
- Never project-, board-, auth-, billing-, or workspace-specific business types.

### `src/shared/utils/`

- Pure helpers with no business ownership.
- No embedded rules about plans, members, tickets, invitations, or modules.

## Dependency Direction

The dependency flow should remain:

```text
src/app
  -> src/domains/<domain>/presentation OR src/modules/<module>/presentation
  -> core/usecases
  -> core/ports
  -> infrastructure
  -> src/shared/infrastructure
  -> external services
```

Additional rule:

- `src/domains/project/` may compose project-scoped module UI
- modules may consume project context or permissions from the project domain when necessary
- the project domain must not own module-specific business rules

## Hard Rules

### Always

1. Keep routing in `src/app/` only.
2. Keep account lifecycle in `src/domains/auth/`.
3. Keep workspace entry flows in `src/domains/workspace/`.
4. Keep project container logic in `src/domains/project/`.
5. Keep project-scoped capabilities in `src/modules/<module>/`.
6. Put reusable primitives in `src/shared/design-system/`.
7. Keep `src/shared/` domain- and module-agnostic.
8. Use shared infrastructure clients from `src/shared/infrastructure/*`.

### Never

1. Recreate global roots such as `src/core/`, `src/presentation/`, or `src/infrastructure/`.
2. Put board or project business rules in `src/shared/`.
3. Put project container logic inside a module.
4. Put module-specific business logic inside `src/domains/project/`.
5. Put Supabase or Stripe client creation inside core/use cases.
6. Treat `src/app/` as a business layer.

## Concrete Example

```text
src/app/(auth)/[projectId]/layout.tsx
  -> src/domains/project/presentation/layouts/projectShell/ProjectShell.tsx

src/app/(auth)/[projectId]/board/page.tsx
  -> src/modules/board/presentation/pages/board/index.tsx
  -> src/modules/board/presentation/hooks/ticket/useTickets.ts
  -> src/modules/board/core/usecases/ticket/listTickets.ts
  -> src/modules/board/core/ports/ticketRepository.ts
  -> src/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase.ts
  -> src/shared/infrastructure/supabase/client-browser.ts
  -> Supabase
```

## Key Takeaway

Workbench is no longer documented as a flat set of top-level business domains only.

It is documented as:

- **domains** for stable business capabilities (`auth`, `billing`, `workspace`, `project`)
- **modules** for project-scoped pluggable capabilities (`board`, then `recipes`, `vacation`, `budget`)
- **shared** for strict cross-cutting code only
