# Status Handling Patterns

## Overview

Loading, error, and empty states are handled through **shared primitives** plus **owner hooks**.

The architectural split is:

```text
Domain or module pages/components
  (src/domains/<domain>/presentation/pages|components
   or src/modules/<module>/presentation/pages|components)
    ↓ use
Shared UI primitives
  (src/shared/design-system)
Shared status helpers
  (src/shared/utils/queryStatus.ts)
    ↓ fed by
Owner hooks
  (src/domains/<domain>/presentation/hooks
   or src/modules/<module>/presentation/hooks)
    ↓ call
Owner usecases
  (src/domains/<domain>/core/usecases
   or src/modules/<module>/core/usecases)
```

## Responsibilities

### Shared UI primitives

Reusable status components belong in:

- `src/shared/design-system/`

Examples:

- `ErrorMessage`
- `EmptyState`
- `Loader`

These components:

- stay domain-agnostic
- receive ready-to-render props
- do not fetch data directly

### Shared status helpers

Status helper functions belong in:

- `src/shared/utils/queryStatus.ts`

They normalize React Query results into a consistent set of flags such as:

- `isLoading`
- `isFetching`
- `hasError`
- `isEmpty`
- `isAnyLoading`

### Owner hooks

Hooks belong in the owner that owns the data:

- `src/modules/board/presentation/hooks/`

Examples:

- `useTickets(projectId)`
- `useCreateTicket()`
- `useEpics(projectId)`

## Example

```typescript
import { EmptyState, ErrorMessage, Loader } from "@/shared/design-system";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import { shouldShowEmpty, shouldShowError, shouldShowLoading } from "@/shared/utils/queryStatus";

export const ProjectBoardPage = ({ projectId }: { projectId: string }) => {
  const ticketsQuery = useTickets(projectId);

  if (shouldShowLoading(ticketsQuery)) {
    return <Loader variant="full-page" />;
  }

  if (shouldShowError(ticketsQuery)) {
    return <ErrorMessage error={ticketsQuery.error} onRetry={ticketsQuery.refetch} />;
  }

  if (shouldShowEmpty(ticketsQuery)) {
    return <EmptyState title="No tickets yet" />;
  }

  return <div>{/* board content */}</div>;
};
```

## Rules

- Domain and module pages/components use owner hooks
- Shared UI primitives stay reusable and domain-agnostic
- Shared status helpers stay pure and cross-cutting
- No status-specific business logic belongs in `src/app/`
- No shared status utility should encode ticket, board, or epic rules

## Recommended Locations

- Reusable status UI: `src/shared/design-system/`
- Status utilities: `src/shared/utils/`
- Owner fetching hooks: `src/domains/<domain>/presentation/hooks/` or `src/modules/<module>/presentation/hooks/`
- Route composition only: `src/app/`
