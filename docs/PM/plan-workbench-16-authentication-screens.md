---
Generated: 2025-01-27
Ticket: 16
Plan: Authentication Screens (Signup & Signin)
---

# Implementation Plan: Authentication Screens (Signup & Signin)

## Summary

Implement signup and signin screens using Supabase Auth following Clean Architecture. Users can create accounts and authenticate to access Workbench projects. **Critical**: Even for verification, we must follow Clean Architecture (UI → Hook → Usecase → Repository → Supabase), not call Supabase directly from pages.

**Key Constraints:**

- Must follow Clean Architecture layer separation
- Use react-hook-form + Zod for form validation
- Use SCSS variables for all styling (no hardcoded values)
- Accessibility (WCAG 2.1 AA) required
- Supabase client already configured with session persistence

## Solution Outline

**Layers Impacted:**

- **Domain**: Auth types (SignUpInput, SignInInput, AuthError) + Zod schemas
- **Ports**: AuthRepository interface (signUp, signIn, signOut, getSession)
- **Infrastructure**: AuthRepositorySupabase implementation
- **Usecases**: signUpUser, signInUser usecases
- **Presentation**: React Query hooks (useSignUp, useSignIn), pages (signup/page.tsx, signin/page.tsx), reusable UI components (Input, Button if missing)

## Sub-Tickets

### 16.1 - Auth Domain Types & Schemas

- **AC**:
  - [x] Create SignUpInput type and SignUpSchema (email, password with validation)
  - [x] Create SignInInput type and SignInSchema (email, password)
  - [x] Create AuthError type for domain errors
  - [x] Place in `core/domain/auth/auth.schema.ts`
- **DoD**:
  - [x] Types exported from domain
  - [x] Zod schemas validate email format and password requirements
  - [x] TypeScript strict compliance
  - [x] No external dependencies (pure TypeScript)
- **Effort**: 2h | **Deps**: none

### 16.2 - Auth Repository Port

- **AC**:
  - [x] Create AuthRepository interface in `core/ports/authRepository.ts`
  - [x] Define methods: signUp(input), signIn(input), signOut(), getSession()
  - [x] Type all parameters and return values with domain types
- **DoD**:
  - [x] Interface properly typed
  - [x] Methods align with Supabase Auth API
  - [x] No implementation, only contract
- **Effort**: 1h | **Deps**: 16.1

### 16.3 - Auth Repository Supabase Implementation

- **AC**:
  - [x] Implement AuthRepository in `infrastructure/supabase/repositories/authRepositorySupabase.ts`
  - [x] Use supabaseClient.auth.signUp(), signInWithPassword(), signOut(), getSession()
  - [x] Map Supabase errors to domain AuthError
  - [x] Return domain types (not Supabase types)
- **DoD**:
  - [x] All repository methods implemented
  - [x] Error mapping to domain errors
  - [x] Uses existing supabaseClient
  - [x] No UI imports
- **Effort**: 3h | **Deps**: 16.1, 16.2

### 16.4 - Auth Usecases

- **AC**:
  - [x] Create signUpUser usecase in `core/usecases/auth/signUpUser.ts`
  - [x] Create signInUser usecase in `core/usecases/auth/signInUser.ts`
  - [x] Usecases take AuthRepository as parameter
  - [x] Validate input with Zod schemas
  - [x] Return domain types
- **DoD**:
  - [x] Usecases are pure functions
  - [x] Input validation using domain schemas
  - [x] No Supabase/React imports
  - [x] Error handling for auth failures
- **Effort**: 2h | **Deps**: 16.1, 16.2, 16.3

### 16.5 - Auth React Query Hooks

- **AC**:
  - [x] Create useSignUp mutation hook in `presentation/hooks/useSignUp.ts`
  - [x] Create useSignIn mutation hook in `presentation/hooks/useSignIn.ts`
  - [x] Add auth query keys to `presentation/hooks/queryKeys.ts`
  - [x] Hooks call usecases, not repositories directly
  - [x] Handle success/error states
- **DoD**:
  - [x] Hooks return mutation objects (mutate, isLoading, error)
  - [x] Query keys follow factory pattern
  - [x] Calls usecases with repository implementation
  - [x] TypeScript strict compliance
- **Effort**: 2h | **Deps**: 16.4

### 16.6 - Reusable UI Components (Input, Button)

- **AC**:
  - [x] Create Input component in `presentation/components/ui/Input.tsx`
  - [x] Create Button component in `presentation/components/ui/Button.tsx`
  - [x] Components use SCSS variables (no hardcoded values)
  - [x] Proper accessibility (labels, error states, ARIA)
  - [x] Support react-hook-form integration
- **DoD**:
  - [x] Components in `presentation/components/ui/`
  - [x] Styles in `styles/components/ui/` (SCSS modules with components, using variables from `styles/variables/`)
  - [x] Arrow function with export default
  - [x] Props typed with `type`
  - [x] SCSS variables used throughout
  - [x] A11y attributes present
  - [x] Unit tests for reusable components
- **Effort**: 4h | **Deps**: none (can be done in parallel)

### 16.7 - Signup Page

- **AC**:
  - [x] Create signup page in `app/signup/page.tsx`
  - [x] Form with email and password fields using react-hook-form
  - [x] Validation using Zod resolver
  - [x] Use useSignUp hook for submission
  - [x] Error display for signup failures
  - [x] Success redirect to `/signin` or project overview
  - [x] Link to signin page
- **DoD**:
  - [x] Page functional with form validation
  - [x] Error handling implemented
  - [x] Redirect works on success
  - [x] SCSS variables used (no hardcoded values)
  - [x] Basic accessibility (form labels, error messages)
  - [x] TypeScript compilation succeeds
- **Effort**: 4h | **Deps**: 16.5, 16.6

### 16.8 - Signin Page

- **AC**:
  - [x] Create signin page in `app/signin/page.tsx`
  - [x] Form with email and password fields using react-hook-form
  - [x] Validation using Zod resolver
  - [x] Use useSignIn hook for submission
  - [x] Error display for signin failures
  - [x] Success redirect to project overview page
  - [x] Link to signup page
- **DoD**:
  - [x] Page functional with form validation
  - [x] Error handling implemented
  - [x] Redirect works on success
  - [x] SCSS variables used (no hardcoded values)
  - [x] Basic accessibility (form labels, error messages)
  - [x] TypeScript compilation succeeds
- **Effort**: 3h | **Deps**: 16.5, 16.6

## Unit Test Spec

**Files:**

- `__tests__/core/usecases/auth/signUpUser.test.ts`
- `__tests__/core/usecases/auth/signInUser.test.ts`
- `__tests__/presentation/components/ui/Input.test.tsx`
- `__tests__/presentation/components/ui/Button.test.tsx`

**Key Tests:**

1. signUpUser: success path, validation errors, repository errors
2. signInUser: success path, invalid credentials, repository errors
3. Input: renders with label, displays error message, react-hook-form integration
4. Button: renders with label, onClick handler, disabled state

**Status**: tests proposed

## Agent Prompts

### Unit Test Coach

```
Create Unit Test Spec for authentication feature (signup/signin usecases, Input/Button UI components).
Plan tests for: signUpUser usecase (success, validation, errors), signInUser usecase (success, invalid credentials, errors), Input component (rendering, error states, react-hook-form), Button component (rendering, interactions, disabled state).
All tests in __tests__/ directory. TypeScript only. NO page component tests.
```

### Architecture-Aware Dev

```
Implement authentication screens following Clean Architecture.
Layers: Domain (auth schemas/types) → Ports (AuthRepository) → Infrastructure (AuthRepositorySupabase) → Usecases (signUpUser, signInUser) → Presentation (React Query hooks, pages).
Use react-hook-form + Zod for validation. SCSS variables only. A11y required.
Start with sub-tickets 16.1-16.5, then 16.6-16.8.
```

### UI Designer

```
Design minimal signup and signin forms with Input and Button components.
Requirements: Clean, minimal design. Proper form layout (labels above inputs), error messages below inputs, accessible (ARIA labels, error associations). Use SCSS variables from styles/variables/. No hardcoded values.
```

### QA & Test Coach

```
Create test plan for authentication screens.
Verify: Form validation (email format, password requirements), error handling (invalid credentials, network errors), success flows (redirects), accessibility (form labels, error messages, keyboard navigation), responsive design.
No e2e tests required for MVP.
```

## Open Questions

1. **Redirect destination**: After successful signup, should we redirect to `/signin` or directly to project overview? Ticket mentions both options. **Decision needed**: Redirect to `/signin` for MVP (requires email verification step via Supabase).

2. **Password requirements**: What are the minimum password requirements? Supabase default or custom? **Decision needed**: Use Supabase defaults (min 6 characters) for MVP, document in validation.

3. **Session persistence**: Supabase client is already configured with `persistSession: true`. Do we need additional session management? **Decision**: No additional work needed, Supabase handles it.

## MVP Cut List

If scope needs reduction:

- ✅ Keep: Basic signup/signin flows, error handling
- ❌ Cut: Email verification UI (handled by Supabase), password reset flow (future ticket), OAuth providers (future ticket), remember me checkbox (handled by Supabase config)

---

**Total Estimated Effort**: 21h (2.6 days)

**Dependencies**: None (can start immediately)

**Risk Notes**:

- Low risk: Supabase Auth is well-documented and client is already configured
- Medium risk: Need to ensure SCSS variables exist or create them as part of 16.6
- Low risk: Clean Architecture adds slight overhead but ensures maintainability
