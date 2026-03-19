# Final Modular Architecture

## Intent

Workbench follows a **domain-first modular architecture**.

The codebase is organized around business domains first, then layered inside each domain.
`src/app/` is reserved for Next.js routing and route composition only.
Cross-cutting concerns live in `src/shared/`.

## Target Structure

```text
src/
  app/                          # Next.js routing only
  domains/
    auth/                       # sign in/up, OAuth, reset password, email verify
    billing/                    # Stripe, plans, subscriptions, webhooks
    workspace/                  # users, invitations, account settings
    project-management/         # tickets, epics, sprints, board
    recipes/                    # future
    vacation/                   # future
    budget/                     # future
  shared/
    design-system/              # UI primitives and their shared helpers
    i18n/                       # translations and i18n hooks
    observability/              # logger, tracing, performance tracking
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

## Domain Ownership

### `src/app/`

- Owns URL structure, route groups, `page.tsx`, `layout.tsx`, route handlers, and route composition.
- Delegates domain rendering to domain presentation modules.
- Must stay thin.

### `src/domains/auth/`

- Owns authentication flows.
- Examples: sign in, sign up, OAuth callbacks, password reset, email verification.

### `src/domains/billing/`

- Owns billing and subscription logic.
- Examples: Stripe checkout, portal, plans, subscription state, webhook handling.

### `src/domains/workspace/`

- Owns user/workspace collaboration concerns.
- Examples: account settings, users, invitations, membership management.

### `src/domains/project-management/`

- Owns the Jira-like work management experience.
- Examples: board, tickets, epics, sprints, project settings.

### Future domains

- `recipes/`
- `vacation/`
- `budget/`

The same domain-first structure applies when these modules are implemented.

## Internal Layering Inside a Domain

Each concrete domain can own some or all of these folders:

```text
src/domains/<domain>/
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
```

### `core/domain`

- Pure business schemas, rules, and constants.
- No React, Next.js, Zustand, React Query, Supabase, or Stripe imports.

### `core/ports`

- Contracts owned by the domain.
- Repository and gateway interfaces used by domain use cases.

### `core/usecases`

- Domain orchestration.
- Depends on domain rules/schemas and ports.
- Never imports framework or low-level client code directly.

### `infrastructure`

- Adapters owned by the domain.
- Implements ports using shared technical clients when needed.

### `presentation`

- Domain-facing UI composition.
- Components, hooks, stores, pages, layouts, navigation config.

## Shared Layer Rules

`src/shared/` is for cross-cutting code only.

### `src/shared/design-system/`

- Reusable UI primitives only.
- May co-locate internal shared helpers with the primitive when they are still cross-cutting.
- Examples:
  - `Button/`
  - `Modal/` + `useModalAccessibility.ts`
  - `Toast/` + `useToastStore.ts`
  - `icons/`

### `src/shared/infrastructure/`

- Technical clients and adapters that are not domain-owned.
- Browser/server/admin Supabase clients.
- Shared Stripe client.
- Shared web concerns like CSRF and rate limiting.

### `src/shared/types/`

- Only truly generic types.
- Never ticket-, auth-, billing-, workspace-, or board-specific business types.

### `src/shared/utils/`

- Pure helpers with no domain ownership.
- No embedded business rules.

## Dependency Direction

The dependency flow should remain:

```text
src/app
  -> src/domains/<domain>/presentation
  -> src/domains/<domain>/core/usecases
  -> src/domains/<domain>/core/ports
  -> src/domains/<domain>/infrastructure
  -> src/shared/infrastructure
  -> external services
```

Never reverse that direction.

## Hard Rules

### Always

1. Keep routing in `src/app/` only.
2. Keep business ownership inside the right domain.
3. Put reusable primitives in `src/shared/design-system/`.
4. Keep `src/shared/` domain-agnostic.
5. Use shared infrastructure clients from `src/shared/infrastructure/*`.

### Never

1. Recreate global roots such as `src/core/`, `src/presentation/`, or `src/infrastructure/`.
2. Put domain business rules in `src/shared/`.
3. Import one domain's presentation layer into another domain's infrastructure.
4. Put Supabase or Stripe client creation inside domain core/use cases.
5. Treat `src/app/` as a business layer.

## Example

```text
src/app/[projectId]/board/page.tsx
  -> src/domains/project-management/presentation/pages/board/index.tsx
  -> src/domains/project-management/presentation/hooks/ticket/useTickets.ts
  -> src/domains/project-management/core/usecases/ticket/listTickets.ts
  -> src/domains/project-management/core/ports/ticketRepository.ts
  -> src/domains/project-management/infrastructure/supabase/ticket/TicketRepository.supabase.ts
  -> src/shared/infrastructure/supabase/client-browser.ts
  -> Supabase
```

## Key Takeaway

Workbench is no longer documented as a single domain with shared helpers around it.
It is documented as a **family of domain modules** (`auth`, `billing`, `workspace`, `project-management`, then future domains), all composed from `src/app/`, and all relying on a strict cross-cutting `src/shared/` layer.
