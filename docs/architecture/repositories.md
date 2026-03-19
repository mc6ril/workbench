# Repository Architecture

## Overview

Repositories belong to the **owner of the business contract**.

That owner can be:

- a **domain** in `src/domains/`
- or a **module** in `src/modules/`

They are **not** grouped under one monolithic global infrastructure root.

Instead:

- domain or module repositories live in their own `infrastructure/`
- shared technical clients live in `src/shared/infrastructure/`

## Final Rule

**Owner-owned adapters, shared-owned clients.**

That means:

- `auth`, `billing`, `workspace`, and `project` own their repository or gateway implementations
- `board` owns its own repositories and mappers
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
    project/
      core/
        ports/
          projectRepository.ts
          invitationRepository.ts
          memberRepository.ts
          moduleRegistry.ts
      infrastructure/
        supabase/
          project/
          invitation/
          member/
          repositories.ts
  modules/
    board/
      core/
        ports/
          ticketRepository.ts
          boardRepository.ts
          epicRepository.ts
          sprintRepository.ts
          labelRepository.ts
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

### Domain or module repository / gateway files

- Implement a port from the owning `core/ports/`
- Stay specific to one owner
- Map low-level payloads to business shapes
- Can depend on shared technical clients

### Shared infrastructure clients

- Create the low-level client instance
- Handle cookies, headers, secrets, request scope, and environment wiring
- Stay business-agnostic

## Recommended Pattern

### 1. Owner factory in owner infrastructure

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

### 3. Owner wiring entrypoint

Examples:

- `src/domains/project/infrastructure/supabase/repositories.ts`
- `src/modules/board/infrastructure/supabase/repositories.ts`

These files can expose:

- browser-ready instances for presentation hooks
- factory helpers for server-side composition

## Usage Patterns

### Browser-side board hook

```typescript
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";

export const useTickets = (projectId: string) => {
  return useQuery({
    queryKey: ["board", "tickets", projectId],
    queryFn: () => listTickets(ticketRepository, { projectId }),
  });
};
```

### Server-side composition

```typescript
import { createTicketRepository } from "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

const client = await createSupabaseServerClient();
const ticketRepository = createTicketRepository(client);
```

## Special Ownership Rules

- `src/domains/project/` owns project settings, members, invitations, permissions, and enabled-module configuration
- `src/modules/board/` owns board data such as tickets, epics, sprints, and labels
- `src/domains/workspace/` may orchestrate create/join flows, but project membership and invitation contracts remain project-owned
- plan-to-module entitlement decisions must stay explicit between `billing` and `project`, never hidden in `shared/`

## Rules

- A repository implementation belongs to the owner that defines the port
- Shared infrastructure creates clients, not business repositories
- Presentation hooks should use use cases, not raw low-level clients
- `src/app/` should compose routes, not implement repository logic
- Cross-owner reuse should happen through shared infrastructure or explicit contracts, not through a global repository bucket

## Benefits

1. Owner boundaries stay explicit.
2. Project container rules stay separate from project modules.
3. Shared client setup remains centralized.
4. New modules can be added without distorting existing domains.
5. The architecture scales naturally from one project module to many.
