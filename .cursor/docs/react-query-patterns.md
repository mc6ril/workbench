# React Query Patterns and Best Practices

This guide documents how React Query fits into the modular domain architecture.

## Overview

React Query is used for **server state**.

In the new architecture:

- hooks live inside the owning domain
- shared UI primitives do not fetch data
- route files in `src/app/` stay thin

## Data Flow

```text
src/app route
  -> domains/<domain>/presentation/pages
  -> domains/<domain>/presentation/hooks
  -> domains/<domain>/core/usecases
  -> domains/<domain>/core/ports
  -> domains/<domain>/infrastructure/*
  -> shared/infrastructure/*
  -> external service
```

## Hook Location

React Query hooks belong in the domain that owns the server state:

- `src/domains/<domain>/presentation/hooks/`

Current examples:

- `src/domains/project-management/presentation/hooks/ticket/useTickets.ts`
- `src/domains/project-management/presentation/hooks/ticket/useCreateTicket.ts`
- `src/domains/project-management/presentation/hooks/board/useBoardConfiguration.ts`
- `src/domains/project-management/presentation/hooks/epic/useEpics.ts`

Future domains such as `auth`, `billing`, and `workspace` may follow the same pattern whenever they own React Query server state.

## Query Keys

Keep query keys close to the domain that owns them.

Recommended location:

- `src/domains/project-management/presentation/hooks/queryKeys.ts`

Example:

```typescript
export const projectManagementQueryKeys = {
  tickets: {
    list: (projectId: string) =>
      ["project-management", "tickets", "list", projectId] as const,
  },
  board: {
    detail: (projectId: string) =>
      ["project-management", "board", "detail", projectId] as const,
  },
} as const;
```

## Query Hook Pattern

```typescript
import { useQuery } from "@tanstack/react-query";

import { listTickets } from "@/domains/project-management/core/usecases/ticket/listTickets";
import { ticketRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { projectManagementQueryKeys } from "./queryKeys";

export const useTickets = (projectId: string) => {
  return useQuery({
    queryKey: projectManagementQueryKeys.tickets.list(projectId),
    queryFn: () => listTickets(ticketRepository, { projectId }),
    enabled: Boolean(projectId),
  });
};
```

## Mutation Hook Pattern

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTicket } from "@/domains/project-management/core/usecases/createTicket";
import { ticketRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { projectManagementQueryKeys } from "./queryKeys";

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket.bind(null, ticketRepository),
    onSuccess: (_createdTicket, input) => {
      queryClient.invalidateQueries({
        queryKey: projectManagementQueryKeys.tickets.list(input.projectId),
      });
    },
  });
};
```

## Rules

- Hooks belong to a domain, not to a global `src/presentation/hooks/` folder
- Hooks call domain use cases
- Hooks do not call shared Supabase clients directly
- Shared design-system components in `src/shared/design-system/` do not contain queries or mutations
- `src/app/` routes should compose domain pages or layouts, not host React Query logic
- Server-only billing webhooks or route handlers are not a replacement for domain-owned client hooks

## Shared Infrastructure

Shared Supabase client creation belongs in:

- `src/shared/infrastructure/supabase/client-browser.ts`
- `src/shared/infrastructure/supabase/client-server.ts`
- `src/shared/infrastructure/supabase/client-admin.ts`

Domain infrastructure may wrap those clients in repository factories or prewired instances.

## Zustand Integration

Zustand stores remain **UI state only** and belong to the domain presentation layer:

- `src/domains/<domain>/presentation/stores/`

Examples:

- filters
- panel state
- selection state
- local board display preferences

Do not move server data ownership from React Query into Zustand.

## Common Pitfalls

- Putting hooks in a global presentation folder
- Calling Supabase directly from hooks
- Fetching inside shared UI primitives
- Encoding domain rules in query selectors or cache utilities
- Using route files in `src/app/` as a replacement for domain pages

## Short Checklist

- Hook created inside the right domain?
- Query key scoped to the right domain?
- Hook calls a use case?
- Repository belongs to the same domain?
- Shared UI stays query-free?
