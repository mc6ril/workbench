# Repository Architecture

## Overview

Repositories belong to the domain that owns the business contract.

They are **not** grouped under one monolithic global infrastructure root.
Instead:

- domain repositories live in `src/domains/<domain>/infrastructure/`
- shared clients live in `src/shared/infrastructure/`

## Final Rule

**Domain-owned adapters, shared-owned clients.**

That means:

- `auth`, `billing`, `workspace`, and `project-management` own their repository or gateway implementations
- `shared/infrastructure/supabase/` owns browser/server/admin Supabase clients
- `shared/infrastructure/stripe/` owns the low-level Stripe client

## Target Structure

```text
src/
  domains/
    auth/
      core/
        ports/
      infrastructure/
        supabase/
    billing/
      core/
        ports/
      infrastructure/
        stripe/
        supabase/
    workspace/
      core/
        ports/
      infrastructure/
        supabase/
    project-management/
      core/
        ports/
          ticketRepository.ts
          boardRepository.ts
          epicRepository.ts
      infrastructure/
        supabase/
          ticket/
            TicketRepository.supabase.ts
            TicketMapper.supabase.ts
          board/
            BoardRepository.supabase.ts
            BoardMapper.supabase.ts
          repositories.ts
  shared/
    infrastructure/
      supabase/
        client-browser.ts
        client-server.ts
        client-admin.ts
      stripe/
        stripeClient.ts
```

## Responsibilities

### Domain repository or gateway files

- Implement a port from `src/domains/<domain>/core/ports/`
- Stay specific to one domain
- Map low-level payloads to domain shapes
- Can depend on shared clients

### Shared infrastructure clients

- Create the low-level client instance
- Handle cookies, headers, secrets, request scope, and environment wiring
- Stay domain-agnostic

## Recommended Pattern

### 1. Domain factory in domain infrastructure

```typescript
export const createTicketRepository = (
  client: SupabaseClient
): TicketRepository => ({
  listByProject: async (projectId) => {
    // Supabase implementation
  },
});
```

### 2. Shared client in shared infrastructure

- `client-browser.ts` for client-side hooks
- `client-server.ts` for request-scoped server usage
- `client-admin.ts` for privileged operations

### 3. Domain wiring entrypoint

`src/domains/project-management/infrastructure/supabase/repositories.ts` can expose:

- browser-ready instances for domain presentation hooks
- factory helpers for server-side composition

## Usage Patterns

### Browser-side domain hook

```typescript
import { ticketRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { listTickets } from "@/domains/project-management/core/usecases/ticket/listTickets";

export const useTickets = (projectId: string) => {
  return useQuery({
    queryKey: ["project-management", "tickets", projectId],
    queryFn: () => listTickets(ticketRepository, { projectId }),
  });
};
```

### Server-side composition

```typescript
import { createTicketRepository } from "@/domains/project-management/infrastructure/supabase/ticket/TicketRepository.supabase";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

const client = await createSupabaseServerClient();
const ticketRepository = createTicketRepository(client);
```

## Rules

- A repository implementation belongs to the domain that owns the port
- Shared infrastructure creates clients, not domain repositories
- Domain presentation hooks should use domain use cases, not raw low-level clients
- `src/app/` should compose routes, not implement repository logic
- Cross-domain reuse should happen through shared infrastructure or explicit domain contracts, not through a global repository bucket

## Benefits

1. Domain ownership stays explicit.
2. Contracts and implementations stay close together.
3. Shared client setup remains centralized.
4. Adding a new domain does not recreate a monolithic infrastructure root.
5. The architecture scales naturally from one domain to many.
