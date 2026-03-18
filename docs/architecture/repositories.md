# Repository Architecture

## Overview

Repositories are now organized **inside the owning domain module**, not in a global `src/infrastructure/` root.

For Workbench, project-management repositories live in:

- `src/domains/project-management/infrastructure/supabase/`

Shared Supabase clients live in:

- `src/shared/infrastructure/supabase/`

This keeps repository ownership close to the domain contracts they implement, while still centralizing low-level clients and request-context creation in `src/shared/`.

## Architecture Decision

**Decision**: keep domain-owned repository factories and use shared Supabase clients for browser, server, and admin contexts.

## Structure

```text
src/
  domains/
    project-management/
      core/
        ports/
          ticketRepository.ts
          boardRepository.ts
          epicRepository.ts
      infrastructure/
        supabase/
          ticket/
            ticketRepository.supabase.ts
            ticket.mapper.ts
          board/
            boardRepository.supabase.ts
            board.mapper.ts
          epic/
            epicRepository.supabase.ts
            epic.mapper.ts
          repositories.ts
  shared/
    infrastructure/
      supabase/
        client-browser.ts
        client-server.ts
        client-admin.ts
```

## Responsibilities

### Domain repository files

- Implement a port from `src/domains/project-management/core/ports/`
- Stay specific to one domain
- Contain mappings between Supabase rows and domain schema objects

### Shared Supabase clients

- Create the underlying browser, server, or admin client
- Handle cross-cutting setup such as cookies, headers, or environment wiring
- Stay domain-agnostic

## Recommended Pattern

### 1. Factory functions in the domain infrastructure

```typescript
export const createTicketRepository = (
  client: SupabaseClient
): TicketRepository => ({
  listByProject: async (projectId) => {
    // Supabase implementation
  },
});
```

### 2. Shared clients in `src/shared/infrastructure/supabase/`

- `client-browser.ts` for client-side hooks
- `client-server.ts` for request-scoped server usage
- `client-admin.ts` for privileged back-office or webhooks when needed

### 3. Domain wiring entrypoint

`src/domains/project-management/infrastructure/supabase/repositories.ts` can expose:

- browser-ready instances for domain presentation hooks
- factory helpers for server-side composition

## Usage Patterns

### Browser-side domain hook

```typescript
import { ticketRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

export const useTickets = (projectId: string) => {
  return useQuery({
    queryKey: ["project-management", "tickets", projectId],
    queryFn: () => listTickets(ticketRepository, { projectId }),
  });
};
```

### Server-side composition

```typescript
import { createTicketRepository } from "@/domains/project-management/infrastructure/supabase/ticket/ticketRepository.supabase";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

const client = await createSupabaseServerClient();
const ticketRepository = createTicketRepository(client);
```

## Rules

- A repository implementation belongs to the domain that owns the port
- Shared infrastructure creates clients, not domain repositories
- Domain presentation hooks should use domain use cases, not raw Supabase clients
- `src/app/` should compose routes, not implement repository logic
- Cross-domain reuse should happen through shared infrastructure or explicit domain contracts, not by scattering repositories in a global folder

## Benefits

1. Domain ownership is explicit.
2. Repository contracts and implementations stay close together.
3. Shared client setup remains centralized.
4. Adding a new domain does not recreate a monolithic infrastructure root.
5. The architecture scales naturally from one domain to many.
