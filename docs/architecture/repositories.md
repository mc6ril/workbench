# Repository Architecture

## Overview

The repository layer follows the **Factory Pattern** to support both browser and server contexts in Next.js, while maintaining Clean Architecture principles.

## Architecture Decision

**Decision**: Keep both factory functions and pre-configured instances.

**Approach**:

- **Factory functions** for server contexts (Server Components, Server Actions, Middleware)
- **Pre-configured instances** for browser contexts (React Query hooks in Client Components)

## Justification

### Why Both Approaches?

1. **Next.js Context Requirements**:
   - **Server-side**: Requires creating Supabase clients with cookie handling per request (`createSupabaseServerClient()`)
   - **Browser-side**: Can use a singleton browser client (`createSupabaseBrowserClient()`)

2. **Performance**:
   - Server contexts need fresh clients per request (cookies change)
   - Browser contexts can reuse a singleton instance

3. **Type Safety**:
   - Both approaches use the same factory functions, ensuring type consistency
   - Same repository interface (`AuthRepository`, `ProjectRepository`, etc.)

4. **Maintainability**:
   - Single source of truth: factory functions define the implementation
   - Centralized wiring in `repositories.ts` prevents duplication
   - Easy to add new repositories following the same pattern

## Implementation

### Structure

```
infrastructure/supabase/
├── auth/
│   ├── AuthRepository.supabase.ts    # Factory function
│   └── AuthMapper.supabase.ts
├── project/
│   ├── ProjectRepository.supabase.ts # Factory function
│   └── ProjectMapper.supabase.ts
├── ticket/
│   ├── TicketRepository.supabase.ts  # Factory function
│   └── TicketMapper.supabase.ts
├── shared/
│   ├── client-browser.ts              # Browser client factory
│   ├── client-server.ts              # Server client factory
│   └── repositoryErrorMapper.ts
├── types/                            # Row types
└── repositories.ts                   # Centralized wiring
```

### Factory Functions

Each repository exports a factory function that takes a Supabase client:

```typescript
export const createAuthRepository = (
  client: SupabaseClient
): AuthRepository => ({
  // Implementation
});
```

### Centralized Wiring

`repositories.ts` provides both:

1. **Browser instances** (for React Query hooks):

```typescript
export const authRepository = createAuthRepository(
  createSupabaseBrowserClient()
);
```

2. **Factory functions** (for server contexts):

```typescript
export { createAuthRepository } from "./auth/AuthRepository.supabase";
```

## Usage Patterns

### Server-Side (Layouts, Server Actions)

```typescript
import { createAuthRepository } from "@/infrastructure/supabase/repositories";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

const supabaseClient = await createSupabaseServerClient();
const authRepository = createAuthRepository(supabaseClient);
```

### Browser-Side (React Query Hooks)

```typescript
import { authRepository } from "@/infrastructure/supabase/repositories";

export const useSession = () => {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => getCurrentSession(authRepository),
  });
};
```

## Benefits

1. **Flexibility**: Support both server and browser contexts seamlessly
2. **Type Safety**: Same interfaces, same types
3. **Testability**: Easy to inject mock clients in tests
4. **Maintainability**: Single implementation, multiple usage patterns
5. **Performance**: Optimized for each context (singleton vs per-request)

## Impact on Codebase

- ✅ All repositories follow the same pattern
- ✅ No duplication between factory and direct implementations
- ✅ Centralized wiring prevents factory proliferation
- ✅ Easy to add new repositories following the same structure
- ✅ Type-safe across all contexts

## Future Considerations

If we need to support additional contexts (e.g., Edge Runtime, Workers), the factory pattern makes it easy to add new client factories without changing repository implementations.
