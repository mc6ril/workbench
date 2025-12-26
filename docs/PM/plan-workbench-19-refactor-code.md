---
Generated: 2025-01-23
Ticket: 19
Plan: Refactoring Existing Code
---

# Implementation Plan: Refactoring Existing Code

## Summary

Refactor repositories, error handling, and authentication to eliminate duplication, standardize patterns, optimize performance, and correctly handle the email verification case during signup. Priority: decide on architecture (factory vs direct), create shared utilities, then refactor each repository.

**Key Constraints:**

- Maintain compatibility with existing Clean Architecture
- Keep all existing tests passing (refactoring without regression)
- Factories needed for server-side (middleware, layouts), direct repositories for browser (React Query hooks)
- Email verification: Supabase returns `session: null` when email verification is required (normal behavior, not an error)

## Solution Outline

**Layers Impacted:**

- **Domain**: Extend `AuthResult` with `requiresEmailVerification` flag, verify consistency of error types
- **Infrastructure**: Create shared utilities (`handleRepositoryError`, error constants), unify patterns between factories/direct, optimize `addCurrentUserAsMember`
- **Usecases**: Adapt `signUpUser` to handle email verification
- **Presentation**: Update `SignupPage` to display email verification message

## Sub-Tickets

### 19.1 - Architecture Decision: Factory Pattern

- **AC**: [x] Analyze current usage of factories vs direct repositories [x] Decide on approach: keep both (factories for server, direct for browser) OR unify [x] Document decision in `docs/architecture/repositories.md` [x] If unifying: decide if we keep only factories (with `createSupabaseBrowserClient()` by default) or direct (with optional factory)
- **DoD**: [x] Decision documented [x] Clear justification of chosen approach [x] Impact on existing code identified
- **Effort**: 1h | **Deps**: none
- **Risk**: Decision impacts all following sub-tickets

### 19.2 - Repository Error Handling Utilities

- **AC**: [x] Create `handleRepositoryError()` helper in `src/infrastructure/supabase/shared/errorHandler.ts` [x] Standardize try/catch pattern with error code verification [x] Extract hardcoded auth error codes into `AUTH_ERROR_CODES` constant in `src/infrastructure/supabase/auth/authErrorConstants.ts` [x] Use `hasErrorCode` consistently (replace inline verifications in ticketRepository)
- **DoD**: [x] `handleRepositoryError` helper created and tested [x] Error constants extracted and exported [x] Unit tests for utilities
- **Effort**: 2h | **Deps**: 19.1 (to know where to put files)
- **Risk**: Must be compatible with all existing repositories

### 19.3 - Auth Repository Refactoring (DRY + Email Verification)

- **AC**: [x] Extract common code between `authRepositorySupabase.ts` and `authRepositorySupabaseFactory.ts` [x] Modify `signUp` to handle `data.session === null` (email verification case) [x] Return `AuthResult` with `requiresEmailVerification: true` instead of throwing error [x] Use new error utilities (`handleRepositoryError`, `AUTH_ERROR_CODES`)
- **DoD**: [x] Duplication eliminated between factory and direct [x] Email verification handled correctly (no error, flag returned) [ ] Existing tests pass + new tests for email verification [x] Code uses shared utilities
- **Effort**: 3h | **Deps**: 19.2 (error utilities)
- **Risk**: Behavior change for email verification (must be backward compatible on UI side)

### 19.4 - Auth Domain Schema Update (Email Verification)

- **AC**: [x] Extend `AuthResult` in `src/core/domain/auth/auth.schema.ts` with `requiresEmailVerification?: boolean` [x] Adapt `signUpUser` usecase to handle new flag [x] Ensure type is backward compatible (optional flag)
- **DoD**: [x] `AuthResult` type extended [x] Usecase adapted [ ] Usecase tests updated [x] Backward compatibility verified
- **Effort**: 1h | **Deps**: 19.3 (repository returns flag)
- **Risk**: Type change (but optional, so safe)

### 19.5 - Auth UI Update (Email Verification Message)

- **AC**: [x] Update `SignupPage` to detect `requiresEmailVerification: true` [x] Display informative message instead of redirecting to signin [x] Message: "Check your email to complete your registration" [x] Adapt `useSignUp` hook if necessary
- **DoD**: [x] UI displays appropriate message [x] No redirect if email verification required [x] Message translated (i18n) [x] UI tests updated
- **Effort**: 2h | **Deps**: 19.4 (usecase returns flag)
- **Risk**: Changes UX flow (may require adjustments)
- **Note**: Not needed for now (feature deferred)

### 19.6 - Project Repository Refactoring (DRY + Performance)

- **AC**: [x] Extract common code between `projectRepositorySupabase.ts` and `projectRepositorySupabaseFactory.ts` [x] Optimize `addCurrentUserAsMember`: reduce from 3 to 1-2 calls (eliminate `rpc('project_exists')` or combine with insert) [x] Use standardized error utilities [x] Standardize `list()` between factory and direct (currently different approaches)
- **DoD**: [x] Duplication eliminated [x] `addCurrentUserAsMember` optimized (max 2 calls) [x] Tests pass + performance tests [x] Code uses shared utilities
- **Effort**: 4h | **Deps**: 19.2 (error utilities)
- **Risk**: Optimization may break existing logic, critical tests

### 19.7 - Ticket Repository Standardization

- **AC**: [x] Standardize error handling in `ticketRepositorySupabase.ts` [x] Replace inline error code verifications with `hasErrorCode` [x] Use `handleRepositoryError` helper [x] Uniformize with patterns from other repositories
- **DoD**: [x] Code standardized (same pattern as projectRepository) [x] Tests pass [x] Code uses shared utilities [x] Consistency with other repositories
- **Effort**: 1h | **Deps**: 19.2 (error utilities)
- **Risk**: Low (pure standardization)

### 19.8 - Documentation & Cleanup

- **AC**: [x] Document repository architecture (if not done in 19.1) [x] Verify no major duplication remains [x] Verify all repositories follow the same patterns [x] Update README or docs if necessary
- **DoD**: [x] Documentation up to date [x] Code review completed [x] No major duplication remaining [x] Patterns consistent everywhere
- **Effort**: 1h | **Deps**: 19.3, 19.6, 19.7 (all repositories refactored)
- **Risk**: Low

## Unit Test Spec

### File: `src/infrastructure/supabase/utils/errorHandler.test.ts`

**Key Tests:**

- `handleRepositoryError` re-throws domain errors with correct codes
- `handleRepositoryError` wraps unknown errors with mapSupabaseError
- `handleRepositoryError` works with different error code lists

**Status**: tests proposed

### File: `src/infrastructure/supabase/repositories/authRepositorySupabase.test.ts` (update)

**Key Tests:**

- `signUp` returns `requiresEmailVerification: true` when session is null
- `signUp` returns session when email verification not required
- Error handling uses shared utilities correctly

**Status**: tests proposed

### File: `src/core/usecases/auth/signUpUser.test.ts` (update)

**Key Tests:**

- `signUpUser` handles `requiresEmailVerification` flag correctly
- Usecase propagates flag from repository

**Status**: tests proposed

## Agent Prompts

### Unit Test Coach

"Generate unit tests for repository error handling utilities (`handleRepositoryError` function) and update tests for auth repository to cover email verification case where `signUp` returns `requiresEmailVerification: true` when Supabase session is null."

### Architecture-Aware Dev

"Refactor auth and project repositories to eliminate duplication between factory and direct implementations. Extract shared error handling into `handleRepositoryError` utility. Optimize `addCurrentUserAsMember` to reduce database calls from 3 to 1-2. Handle email verification case in `signUp` (return flag instead of throwing error)."

### UI Designer

"Update SignupPage to display informative message when email verification is required (`requiresEmailVerification: true`). Message should be user-friendly, translated, and prevent automatic redirect to signin page."

### QA & Test Coach

"Create test plan for refactored repositories: verify no regression in existing functionality, test email verification flow end-to-end, verify error handling consistency across all repositories, performance test for optimized `addCurrentUserAsMember` method."

## Open Questions

1. **Factory vs Direct**: Should we keep both approaches (factories for server, direct for browser) or unify? Which approach is most maintainable long-term?
2. **Email Verification UX**: After displaying "check your email" message, should we redirect to signin after X seconds, or leave user on signup page?
3. **Performance Target**: For `addCurrentUserAsMember`, is it acceptable to make 2 calls (getSession + insert with return), or must we absolutely reduce to 1?

## MVP Cut List

If simplification needed:

- **Must Have**: 19.2 (error utilities), 19.3 (auth DRY), 19.6 (project DRY + perf), 19.7 (ticket standardization)
- **Should Have**: 19.4 (email verification domain), 19.5 (email verification UI)
- **Nice to Have**: 19.1 (architecture documentation), 19.8 (cleanup docs)

**Note**: Email verification (19.4, 19.5) can be deferred if not critical, but DRY and performance refactorings are essential for maintainability.
