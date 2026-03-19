# Testing Guide

This guide reflects the domain + module architecture.

## What We Test

### Yes

- domain or module rules and schemas inside `src/domains/<domain>/core/domain/` or `src/modules/<module>/core/domain/`
- domain or module use cases inside `src/domains/<domain>/core/usecases/` or `src/modules/<module>/core/usecases/`
- reusable UI primitives inside `src/shared/design-system/`

### No

- route files in `src/app/`
- domain pages and layouts
- domain hooks
- domain stores
- infrastructure adapters

## Test File Placement

Tests stay in `__tests__/` at the project root and mirror the source structure.

Examples:

```text
src/modules/board/core/domain/rules/ticket.rules.ts
-> __tests__/modules/board/core/domain/rules/ticket.rules.test.ts

src/modules/board/core/usecases/ticket/listTickets.ts
-> __tests__/modules/board/core/usecases/ticket/listTickets.test.ts

src/shared/design-system/Button/index.tsx
-> __tests__/shared/design-system/Button.test.tsx
```

Mocks stay in `__mocks__/`.

## Domain Test Example

```typescript
import { canMoveTicketToStatus } from "@/modules/board/core/domain/rules/ticket.rules";

describe("canMoveTicketToStatus", () => {
  it("returns true when the move respects the board rules", () => {
    expect(
      canMoveTicketToStatus({
        currentStatus: "todo",
        nextStatus: "in_progress",
      })
    ).toBe(true);
  });
});
```

## Use Case Test Example

```typescript
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const ticketRepositoryMock: jest.Mocked<TicketRepository> = {
  listByProject: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe("listTickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates to the repository with the project id", async () => {
    ticketRepositoryMock.listByProject.mockResolvedValue([]);

    await listTickets(ticketRepositoryMock, { projectId: "project-1" });

    expect(ticketRepositoryMock.listByProject).toHaveBeenCalledWith("project-1");
  });
});
```

## Shared UI Test Example

```typescript
import { render, screen } from "@testing-library/react";

import Button from "@/shared/design-system/Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button label="Create ticket" onClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Create ticket" })).toBeInTheDocument();
  });
});
```

## Rules

- Use Jest
- Use TypeScript only
- Mock external dependencies
- Test behavior, not implementation details
- Mock repositories or external clients instead of hitting Supabase
- Keep route composition, route handlers, domain hooks, and stores out of the default unit-test target set

## Quick Checklist

- Test mirrors the source path in `__tests__/`
- Domain logic tested in isolation
- Use case tested with mocked ports
- Shared UI tested with React Testing Library
- No page, hook, store, or infrastructure tests added by default
