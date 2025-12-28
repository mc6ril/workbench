---
Generated: 2025-01-27 20:15:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-22
---

# Implementation Plan: Add Unit Tests for Core Domain, Ports, Usecases, and Infrastructure

## Summary

Add comprehensive unit tests for all core business logic layers (domain error factories, port mock factories, 14 usecases, infrastructure error handlers) and complete end-to-end flow tests to ensure code quality, prevent regressions, and maintain Clean Architecture compliance. Tests must follow Arrange-Act-Assert pattern, use mocks from `__mocks__/`, and cover success paths, error paths, and edge cases.

**Key constraints**: No React/Next.js imports in domain/usecase tests, all tests in `__tests__/` directory, infrastructure tested via usecases (not directly), test-first protocol (generate test specs before implementation).

## Solution Outline

- **Domain** (`core/domain/`): Test error factory functions (createNotFoundError, createConstraintError, createDatabaseError)
- **Ports** (`core/ports/`): Create AuthRepository mock factory (mock factories tested indirectly via usecase tests)
- **Usecases** (`core/usecases/`): Test 14 usecases (10 auth, 3 project, 1 ticket) with mocked repositories
- **Infrastructure** (`infrastructure/supabase/`): Test error mappers and handlers (not repository implementations)
- **Flow Tests**: Test complete end-to-end flows (signup → signin → project access → ticket listing)

## Sub-Tickets

### 22.1 - Add Domain Error Factory Tests

- AC: [x] Test `createNotFoundError` returns correct NotFoundError structure [x] Test `createConstraintError` returns correct ConstraintError structure [x] Test `createDatabaseError` returns correct DatabaseError structure [x] Test error messages are correctly formatted with entity type and ID
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 1h | Deps: [none]

### 22.2 - Create AuthRepository Mock Factory

- AC: [x] Create `__mocks__/core/ports/authRepository.ts` with `createAuthRepositoryMock` factory [x] Mock factory implements all AuthRepository methods as jest.fn() [x] Mock factory allows method overrides via partial parameter
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 2h | Deps: [22.1]
- Note: No dedicated tests for mock factories - they are tested indirectly via usecase tests

### 22.3 - ProjectRepository Mock Factory

- AC: [x] Mock factory `createProjectRepositoryMock` already exists in `__mocks__/core/ports/projectRepository.ts` [x] Mock factory verified to work correctly via usecase tests
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 1h | Deps: [none] (mock factory already exists)
- Note: No dedicated tests for mock factories - they are tested indirectly via usecase tests

### 22.4 - Test Infrastructure Error Mappers and Handlers

- AC: [x] Test `repositoryErrorMapper.ts` maps Supabase PGRST116 to database error [x] Test `repositoryErrorMapper.ts` maps constraint violations (23505, 23503, 23514) to ConstraintError [x] Test `handleRepositoryError` re-throws domain errors with matching codes [x] Test `handleRepositoryError` maps unknown errors via mapSupabaseError [x] Test `handleAuthError` re-throws domain auth errors with matching codes [x] Test `handleAuthError` maps unknown errors via mapSupabaseAuthError
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 2h | Deps: [22.1]

### 22.5 - Test Auth Usecases (Batch 1: signUp, signIn, signOut, getCurrentSession)

- AC: [x] Test `signUpUser` - success with valid input, Zod validation errors, repository errors [x] Test `signInUser` - success with valid credentials, invalid credentials, repository errors [x] Test `signOutUser` - success, repository errors [x] Test `getCurrentSession` - with session, without session (null), repository errors [x] All tests use `createAuthRepositoryMock` from `__mocks__/core/ports/authRepository.ts`
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 3h | Deps: [22.2]

### 22.6 - Test Auth Usecases (Batch 2: password reset, email verification, user management)

- AC: [x] Test `resetPasswordForEmail` - success, email not found, repository errors [x] Test `updatePassword` - success with valid token, invalid token, repository errors [x] Test `verifyEmail` - success with valid token, invalid token, repository errors [x] Test `resendVerificationEmail` - success, repository errors [x] Test `updateUser` - success, validation errors, repository errors [x] Test `deleteUser` - success, repository errors [x] All tests use `createAuthRepositoryMock` from `__mocks__/core/ports/authRepository.ts`
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 3h | Deps: [22.2]

### 22.7 - Test Project Usecases (listProjects, getProject, addUserToProject)

- AC: [x] Test `listProjects` - success with projects, empty list, repository errors [x] Test `getProject` - success with existing project, not found (null), repository errors [x] Test `addUserToProject` - success, project not found, constraint violations (already member), repository errors [x] All tests use `createProjectRepositoryMock` from `__mocks__/core/ports/projectRepository.ts`
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 2h | Deps: [22.3]

### 22.8 - Test Ticket Usecase (listTickets)

- AC: [x] Test `listTickets` - success with tickets, empty list, repository errors [x] Test uses `createTicketRepositoryMock` from `__mocks__/core/ports/ticketRepository.ts` [x] Test verifies repository.listByProject called with correct projectId
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 1h | Deps: [none] (mock factory already exists)

### 22.9 - Test Complete End-to-End Flows

- AC: [x] Test complete signup flow: signUpUser → getCurrentSession (with email verification requirement) [x] Test complete signin flow: signInUser → getCurrentSession → listProjects [x] Test complete project access flow: listProjects → getProject → addUserToProject [x] Test complete ticket flow: listProjects → listTickets [x] All flow tests use mock user credentials (cyril.lesot@yahoo.fr / Azerty123!) [x] Flow tests verify multiple usecases work together correctly [x] Flow tests cover happy paths and error propagation
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 3h | Deps: [22.5, 22.6, 22.7, 22.8]

## Unit Test Spec

### Domain Error Factory Tests

- **File path**: `__tests__/core/domain/repositoryError.test.ts`
- **Key test names**:
  - `"should create NotFoundError with correct structure and message"`
  - `"should create ConstraintError with correct structure and message"`
  - `"should create DatabaseError with correct structure and original error"`
  - `"should format error messages correctly with entity type and ID"`
- **Status**: tests proposed

### AuthRepository Mock Factory

- **File path**: `__mocks__/core/ports/authRepository.ts`
- **Status**: implemented (factory created, tested indirectly via usecase tests)

### ProjectRepository Mock Factory

- **File path**: `__mocks__/core/ports/projectRepository.ts`
- **Status**: already exists (factory exists, tested indirectly via usecase tests)

### Infrastructure Error Handler Tests

- **File path**: `__tests__/infrastructure/supabase/shared/errors/errorHandlers.test.ts`
- **Key test names**:
  - `"should re-throw domain repository errors with matching codes"`
  - `"should map unknown errors to domain errors via mapSupabaseError"`
  - `"should re-throw domain auth errors with matching codes"`
  - `"should map unknown auth errors via mapSupabaseAuthError"`
- **Status**: tests proposed

### Error Mapper Tests

- **File path**: `__tests__/infrastructure/supabase/shared/errors/repositoryErrorMapper.test.ts`
- **Key test names**:
  - `"should map Supabase PGRST116 error to DatabaseError"`
  - `"should map constraint violation codes (23505, 23503, 23514) to ConstraintError"`
  - `"should map generic Supabase errors to DatabaseError"`
  - `"should map Error instances to DatabaseError"`
  - `"should handle unknown error types with fallback"`
- **Status**: tests proposed

### Auth Usecase Tests (Batch 1)

- **File paths**:
  - `__tests__/core/usecases/auth/signUpUser.test.ts`
  - `__tests__/core/usecases/auth/signInUser.test.ts`
  - `__tests__/core/usecases/auth/signOutUser.test.ts`
  - `__tests__/core/usecases/auth/getCurrentSession.test.ts`
- **Key test names**:
  - `"should sign up user with valid input"`
  - `"should throw ZodError for invalid signup input"`
  - `"should propagate repository errors"`
  - `"should sign in user with valid credentials"`
  - `"should throw InvalidCredentialsError for invalid credentials"`
  - `"should sign out user successfully"`
  - `"should get current session when session exists"`
  - `"should return null when no session exists"`
- **Status**: tests proposed

### Auth Usecase Tests (Batch 2)

- **File paths**:
  - `__tests__/core/usecases/auth/resetPasswordForEmail.test.ts`
  - `__tests__/core/usecases/auth/updatePassword.test.ts`
  - `__tests__/core/usecases/auth/verifyEmail.test.ts`
  - `__tests__/core/usecases/auth/resendVerificationEmail.test.ts`
  - `__tests__/core/usecases/auth/updateUser.test.ts`
  - `__tests__/core/usecases/auth/deleteUser.test.ts`
- **Key test names**:
  - `"should reset password for email successfully"`
  - `"should throw PasswordResetError when email not found"`
  - `"should update password with valid token"`
  - `"should throw InvalidTokenError for invalid token"`
  - `"should verify email with valid token"`
  - `"should resend verification email successfully"`
  - `"should update user information successfully"`
  - `"should delete user account successfully"`
- **Status**: tests proposed

### Project Usecase Tests

- **File paths**:
  - `__tests__/core/usecases/project/listProjects.test.ts`
  - `__tests__/core/usecases/project/getProject.test.ts`
  - `__tests__/core/usecases/project/addUserToProject.test.ts`
- **Key test names**:
  - `"should list projects with user roles"`
  - `"should return empty array when no projects"`
  - `"should get project by ID when exists"`
  - `"should return null when project not found"`
  - `"should add user to project successfully"`
  - `"should throw NotFoundError when project not found"`
  - `"should throw ConstraintError when user already member"`
- **Status**: tests proposed

### Ticket Usecase Tests

- **File path**: `__tests__/core/usecases/ticket/listTickets.test.ts`
- **Key test names**:
  - `"should list tickets for project"`
  - `"should return empty array when no tickets"`
  - `"should propagate repository errors"`
- **Status**: tests proposed

### Complete Flow Tests

- **File path**: `__tests__/core/usecases/flows/authFlow.test.ts`, `__tests__/core/usecases/flows/projectFlow.test.ts`, `__tests__/core/usecases/flows/ticketFlow.test.ts`
- **Key test names**:
  - `"should complete signup flow: signUp → getCurrentSession (with email verification)"`
  - `"should complete signin flow: signIn → getCurrentSession → listProjects"`
  - `"should complete project access flow: listProjects → getProject → addUserToProject"`
  - `"should complete ticket flow: listProjects → listTickets"`
  - `"should handle error propagation in complete flows"`
- **Status**: tests proposed

## Agent Prompts

### Unit Test Coach

Given workbench-22 (Add Unit Tests for Core), design concrete Jest test specs and file scaffolds for:

1. Domain error factory functions (`repositoryError.ts`)
2. AuthRepository mock factory (create and test)
3. Infrastructure error mappers and handlers
4. All 14 usecases (10 auth, 3 project, 1 ticket) with mocked repositories
5. Complete end-to-end flow tests (signup → signin → project access → ticket listing)

Ensure alignment with Clean Architecture, no tests inside `src/`, all tests in `__tests__/` mirroring source structure, Arrange-Act-Assert pattern, and comprehensive coverage (success, error, edge cases). Use mock user credentials (cyril.lesot@yahoo.fr / Azerty123!) for flow tests.

### Architecture-Aware Dev

Implement workbench-22 unit tests: create domain error factory tests, AuthRepository mock factory (no dedicated tests - tested indirectly via usecases), infrastructure error mapper/handler tests, all 14 usecase tests with mocked repositories, and complete flow tests. Follow existing test patterns from `createProject.test.ts` and `hasProjectAccess.test.ts`. Ensure all tests use mocks from `__mocks__/`, follow Arrange-Act-Assert pattern, and have no React/Next.js imports in domain/usecase tests.

### UI Designer

No direct UI changes for workbench-22; validate that test utilities and mock factories support future UI component testing needs and propose any needed conventions for testing UI components that depend on these usecases.

### QA & Test Coach

Define a comprehensive QA checklist for workbench-22 focusing on:

1. Test coverage verification (domain, ports, usecases, infrastructure)
2. Test quality (Arrange-Act-Assert, descriptive names, TypeScript types)
3. Mock factory contract compliance
4. Complete flow test coverage
5. Error propagation testing
6. Test execution (`yarn test` passes)
7. Coverage report analysis

Verify that all tests follow project testing patterns and that test coverage increases significantly for core layers.

## Open Questions

1. Should we set minimum coverage thresholds (e.g., 80% for domain/usecases) or focus on comprehensive test coverage without strict thresholds?
2. For complete flow tests, should we test actual integration between usecases or keep them isolated with mocked repositories (recommended: isolated with mocks)?
3. Should we add test utilities for common test data builders (e.g., `createMockAuthResult`, `createMockProject`) or keep tests self-contained?

## MVP Cut List

If time is limited, prioritize in this order:

1. **Must Have**: Domain error factory tests (22.1), AuthRepository mock factory (22.2), core auth usecases (signUp, signIn, getCurrentSession) (22.5)
2. **Should Have**: Project usecases (22.7), remaining auth usecases (22.6), infrastructure error handlers (22.4)
3. **Nice to Have**: Complete flow tests (22.9), ticket usecase (22.8)
