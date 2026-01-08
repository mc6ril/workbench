# Status Handling Patterns

## Overview

This document describes the shared patterns for handling loading, error, and empty states in React Query hooks and UI components. These patterns provide consistent user feedback for async operations and data states across the application.

## Architecture

Status handling follows Clean Architecture principles:

```
UI Components (presentation/components/ui/)
    ↓ use
Status Utilities (shared/utils/status.ts)
    ↓ use
React Query Hooks (presentation/hooks/)
    ↓ use
Usecases (core/usecases/)
```

**Key Principles:**

- **Shared Layer**: Status utilities in `shared/utils/status.ts` can be imported by all layers
- **Reusable Components**: UI components in `presentation/components/ui/` for consistent display
- **Type Safety**: All utilities and components are fully typed with TypeScript
- **Accessibility**: All components follow WCAG 2.1 AA compliance

## Components

### ErrorMessage

The `ErrorMessage` component displays error messages consistently across the application.

**Location**: `presentation/components/ui/ErrorMessage.tsx`

**Props:**

```typescript
type Props = {
  error: { code?: string } | null | undefined;
  onRetry?: () => void;
  className?: string;
  "aria-label"?: string;
};
```

**Usage:**

```typescript
import { ErrorMessage } from "@/presentation/components/ui";

const { data, error, refetch } = useProjects();

if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />;
}
```

**Features:**

- Automatically translates error codes using `getErrorMessage()` from `shared/i18n/errorMessages.ts`
- Optional retry button when `onRetry` callback is provided
- Accessibility: `role="alert"`, `aria-live="assertive"`
- Uses error colors from SCSS variables

### EmptyState

The `EmptyState` component displays empty data states consistently.

**Location**: `presentation/components/ui/EmptyState.tsx`

**Props:**

```typescript
type Props = {
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};
```

**Usage:**

```typescript
import { EmptyState } from "@/presentation/components/ui";

const { data } = useProjects();

if (Array.isArray(data) && data.length === 0) {
  return (
    <EmptyState
      title="No projects"
      message="Create your first project to get started"
      action={<Button label="Create Project" onClick={handleCreate} />}
    />
  );
}
```

**Features:**

- Required `title` prop for the empty state heading
- Optional `message` prop (defaults to i18n `common.emptyState.defaultMessage`)
- Optional `action` prop for action buttons (e.g., "Create first project")
- Accessibility: `role="status"`, `aria-live="polite"`
- Uses neutral colors from SCSS variables

### Loader

The `Loader` component displays loading states (already implemented in workbench-21).

**Location**: `presentation/components/ui/Loader.tsx`

**Variants:**

- `full-page`: Centered loader for full-page loading states
- `inline`: Inline loader for component-level loading states

## Status Utilities

Status utilities provide type-safe functions for checking React Query result states.

**Location**: `shared/utils/status.ts`

### Core Functions

#### `getQueryStatus<TData>(result)`

Returns a unified status object from a React Query result (query or mutation).

```typescript
import { getQueryStatus } from "@/shared/utils/status";

const { data, isLoading, error } = useProjects();
const status = getQueryStatus({ data, isLoading, error });

// status.isLoading - true when initial loading (no cached data)
// status.isFetching - true when fetching (including background refetches)
// status.isPending - true when mutation is pending
// status.hasError - true when there's an error
// status.isEmpty - true when data is empty (null, undefined, empty array/object)
// status.isAnyLoading - true when any loading state is active
```

#### `isQueryLoading<TData, TError>(queryResult)`

Checks if a query is in loading state (initial fetch with no cached data).

```typescript
import { isQueryLoading } from "@/shared/utils/status";

const queryResult = useProjects();
if (isQueryLoading(queryResult)) {
  return <Loader variant="full-page" />;
}
```

#### `isQueryError<TData, TError>(queryResult)`

Checks if a query has an error.

```typescript
import { isQueryError } from "@/shared/utils/status";

const queryResult = useProjects();
if (isQueryError(queryResult)) {
  return <ErrorMessage error={queryResult.error} />;
}
```

#### `isQueryEmpty<TData, TError>(queryResult)`

Checks if query data is empty (null, undefined, empty array, or empty object).

```typescript
import { isQueryEmpty } from "@/shared/utils/status";

const queryResult = useProjects();
if (isQueryEmpty(queryResult)) {
  return <EmptyState title="No projects" />;
}
```

#### `isMutationPending<TData, TError, TVariables, TContext>(mutationResult)`

Checks if a mutation is pending.

```typescript
import { isMutationPending } from "@/shared/utils/status";

const mutation = useCreateProject();
if (isMutationPending(mutation)) {
  return <Loader variant="inline" />;
}
```

#### `isMutationError<TData, TError, TVariables, TContext>(mutationResult)`

Checks if a mutation has an error.

```typescript
import { isMutationError } from "@/shared/utils/status";

const mutation = useCreateProject();
if (isMutationError(mutation)) {
  return <ErrorMessage error={mutation.error} />;
}
```

### Helper Functions

#### `shouldShowLoading<TData>(result)`

Determines if loading state should be shown (combines `isLoading` and `isPending`).

```typescript
import { shouldShowLoading } from "@/shared/utils/status";

const queryResult = useProjects();
if (shouldShowLoading(queryResult)) {
  return <Loader variant="full-page" />;
}
```

#### `shouldShowError<TData>(result)`

Determines if error state should be shown.

```typescript
import { shouldShowError } from "@/shared/utils/status";

const queryResult = useProjects();
if (shouldShowError(queryResult)) {
  return <ErrorMessage error={queryResult.error} onRetry={queryResult.refetch} />;
}
```

#### `shouldShowEmpty<TData>(result)`

Determines if empty state should be shown (no loading, no error, data is empty).

```typescript
import { shouldShowEmpty } from "@/shared/utils/status";

const queryResult = useProjects();
if (shouldShowEmpty(queryResult)) {
  return <EmptyState title="No projects" />;
}
```

## Common Patterns

### Pattern 1: Query with Loading, Error, and Empty States

```typescript
import { ErrorMessage, EmptyState, Loader } from "@/presentation/components/ui";
import { shouldShowLoading, shouldShowError, shouldShowEmpty } from "@/shared/utils/status";

const MyComponent = () => {
  const { data, isLoading, error, refetch } = useProjects();

  if (shouldShowLoading({ isLoading, data, error })) {
    return <Loader variant="full-page" />;
  }

  if (shouldShowError({ error })) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  if (shouldShowEmpty({ data, isLoading, error })) {
    return <EmptyState title="No projects" />;
  }

  return <ProjectList projects={data} />;
};
```

### Pattern 2: Using getQueryStatus for Combined Status

```typescript
import { ErrorMessage, EmptyState, Loader } from "@/presentation/components/ui";
import { getQueryStatus } from "@/shared/utils/status";

const MyComponent = () => {
  const queryResult = useProjects();
  const status = getQueryStatus(queryResult);

  if (status.isAnyLoading) {
    return <Loader variant="full-page" />;
  }

  if (status.hasError) {
    return <ErrorMessage error={queryResult.error} onRetry={queryResult.refetch} />;
  }

  if (status.isEmpty) {
    return <EmptyState title="No projects" />;
  }

  return <ProjectList projects={queryResult.data} />;
};
```

### Pattern 3: Mutation with Error Handling

```typescript
import { ErrorMessage } from "@/presentation/components/ui";
import { isMutationError } from "@/shared/utils/status";

const CreateProjectForm = () => {
  const createProject = useCreateProject();

  if (isMutationError(createProject)) {
    return <ErrorMessage error={createProject.error} />;
  }

  return (
    <Form onSubmit={(data) => createProject.mutate(data)}>
      {/* Form fields */}
    </Form>
  );
};
```

### Pattern 4: Inline Loading Indicator

```typescript
import { Loader } from "@/presentation/components/ui";

const ProjectList = () => {
  const { data, isFetching } = useProjects();

  return (
    <div>
      {isFetching && <Loader variant="inline" />}
      <ul>
        {data?.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

## When to Use Each Component

### Use `ErrorMessage` when:

- A React Query query or mutation has an error
- You want consistent error display across the application
- You want to provide a retry option to users
- Error needs to be announced to screen readers (`role="alert"`)

### Use `EmptyState` when:

- Data is successfully loaded but empty (no items to display)
- You want to guide users to take action (e.g., "Create your first project")
- Empty state needs to be announced to screen readers (`role="status"`)

### Use `Loader` when:

- Data is being fetched (initial load or background refetch)
- Operation is in progress (mutation pending)
- You want to indicate that content is loading

### Use Status Utilities when:

- You need to check loading/error/empty states programmatically
- You want type-safe status checking
- You need to combine multiple status checks

## Best Practices

1. **Always check loading state first**: Prevent rendering with undefined data
2. **Check error state before empty state**: Errors take precedence over empty data
3. **Use status utilities for type safety**: Prefer utilities over manual checks
4. **Provide retry options**: Use `onRetry` prop in `ErrorMessage` when appropriate
5. **Use appropriate loader variants**: `full-page` for initial loads, `inline` for background refetches
6. **Accessibility first**: All components include proper ARIA attributes
7. **Consistent styling**: All components use SCSS variables from `styles/variables/*`
8. **i18n for all user-facing text**: Use translation keys, never hardcode strings

## Migration Guide

### Before (Inline Error Handling)

```typescript
const { data, error } = useProjects();

if (error) {
  return (
    <div className="error" role="alert">
      Error: {error.message}
    </div>
  );
}
```

### After (Using ErrorMessage)

```typescript
import { ErrorMessage } from "@/presentation/components/ui";

const { data, error, refetch } = useProjects();

if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />;
}
```

### Before (Inline Empty State)

```typescript
const { data } = useProjects();

if (!data || data.length === 0) {
  return <Text>No projects</Text>;
}
```

### After (Using EmptyState)

```typescript
import { EmptyState } from "@/presentation/components/ui";

const { data } = useProjects();

if (Array.isArray(data) && data.length === 0) {
  return <EmptyState title="No projects" />;
}
```

## Related Documentation

- [React Query Patterns](.cursor/docs/react-query-patterns.md) - React Query usage patterns
- [Design System](docs/architecture/design-system.md) - SCSS variables and design tokens
- [Component Structure](.cursor/rules/ui/component-structure.mdc) - Component patterns and conventions
- [Accessibility](.cursor/rules/ui/accessibility.mdc) - Accessibility requirements
