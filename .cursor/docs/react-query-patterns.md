# React Query Patterns and Best Practices

This guide documents how React Query fits into the final domain + module architecture.

## Overview

React Query is used for **server state**.

In the architecture:

- hooks live inside the owning **domain or module**
- shared UI primitives do not fetch data
- route files in `src/app/` stay thin

## Data Flow

```text
src/app route
  -> domains/<domain>/presentation/pages OR modules/<module>/presentation/pages
  -> presentation/hooks
  -> core/usecases
  -> core/ports
  -> infrastructure/*
  -> shared/infrastructure/*
  -> external service
```

## Hook Location

React Query hooks belong in the owner that owns the server state:

- `src/domains/<domain>/presentation/hooks/`
- `src/modules/<module>/presentation/hooks/`

Target shape examples:

- `src/domains/session/presentation/hooks/useSession.ts`
- `src/domains/profile/presentation/hooks/profile/useMyProfile.ts`
- `src/domains/viewer/presentation/hooks/useViewer.ts`
- `src/domains/workspace/presentation/hooks/useProjectsWithStats.ts`
- `src/domains/project/presentation/hooks/`
- `src/modules/board/presentation/hooks/ticket/useTickets.ts`
- `src/modules/board/presentation/hooks/epic/useEpics.ts`

## Query Keys

Keep query keys close to the owner that owns them.

Recommended locations:

- `src/domains/<domain>/presentation/hooks/queryKeys.ts`
- `src/modules/<module>/presentation/hooks/queryKeys.ts`

Example for the board module:

```typescript
export const boardQueryKeys = {
  tickets: {
    list: (projectId: string) => ["board", "tickets", "list", projectId] as const,
  },
  board: {
    detail: (projectId: string) => ["board", "detail", projectId] as const,
  },
} as const;
```

## Query Hook Pattern

```typescript
import { useQuery } from "@tanstack/react-query";

import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { boardQueryKeys } from "./queryKeys";

export const useTickets = (projectId: string) => {
  return useQuery({
    queryKey: boardQueryKeys.tickets.list(projectId),
    queryFn: () => listTickets(ticketRepository, { projectId }),
    enabled: Boolean(projectId),
  });
};
```

## Mutation Hook Pattern

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTicket } from "@/modules/board/core/usecases/ticket/createTicket";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { boardQueryKeys } from "./queryKeys";

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket.bind(null, ticketRepository),
    onSuccess: (_createdTicket, input) => {
      queryClient.invalidateQueries({
        queryKey: boardQueryKeys.tickets.list(input.projectId),
      });
    },
  });
};
```

## Composition Hook Pattern

A composition owner such as `viewer` may aggregate hooks from other owners.

This is the preferred pattern for current-user UI that would otherwise keep
repeating `session + profile + capability` wiring in many components.

```typescript
import { useMemo } from "react";

import { useSession } from "@/shared/session";
import { useMyProfile } from "@/shared/profile";

export const useViewer = () => {
  const sessionQuery = useSession();
  const profileQuery = useMyProfile();

  const data = useMemo(() => {
    if (!sessionQuery.data) {
      return null;
    }

    return {
      userId: sessionQuery.data.userId,
      loginEmail: sessionQuery.data.loginEmail,
      displayName: profileQuery.data?.displayName ?? null,
      avatarUrl: profileQuery.data?.avatarUrl ?? null,
      isSuperuser: sessionQuery.data.isSuperuser,
    };
  }, [profileQuery.data, sessionQuery.data]);

  return {
    data,
    isLoading: sessionQuery.isLoading || profileQuery.isLoading,
  };
};
```

Rules for composition owners:

- compose read hooks, do not own their mutations
- do not duplicate business rules from the source owners
- avoid exposing raw tokens broadly through the composed model
- prefer explicit names such as `loginEmail` over ambiguous `email`

## Rules

- Hooks belong to a domain or module, not to a global `src/presentation/hooks/` folder
- Hooks call use cases
- Hooks do not call shared Supabase clients directly
- Shared design-system components in `src/shared/design-system/` do not contain queries or mutations
- `src/app/` routes should compose domain shells, domain pages, or module pages, not host React Query logic
- Server-only billing webhooks or route handlers are not a replacement for owner-owned client hooks
- Read-model owners such as `viewer` may compose other owner hooks instead of owning repositories

## Shared Infrastructure

Shared Supabase client creation belongs in:

- `src/shared/infrastructure/supabase/client-browser.ts`
- `src/shared/infrastructure/supabase/client-server.ts`
- `src/shared/infrastructure/supabase/client-admin.ts`

Owner infrastructure may wrap those clients in repository factories or prewired instances.

## Zustand Integration

Zustand stores remain **UI state only** and belong to the owner presentation layer:

- `src/domains/<domain>/presentation/stores/`
- `src/modules/<module>/presentation/stores/`

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
- Encoding business rules in query selectors or cache utilities
- Using route files in `src/app/` as a replacement for owner pages or shells

## Short Checklist

- Hook created inside the right domain or module?
- Query key scoped to the right owner?
- Hook calls a use case?
- Repository belongs to the same owner?
- Shared UI stays query-free?
