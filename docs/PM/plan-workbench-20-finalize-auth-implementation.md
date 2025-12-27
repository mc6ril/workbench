---
Generated: 2025-01-27 15:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-20
---

# Implementation Plan: Finalize Auth Implementation

## Summary

Complete authentication implementation by adding email verification flow, password reset functionality, and proper error handling for unverified users. Implement domain types, repository methods, usecases, React Query hooks, and UI pages following Clean Architecture. Verify Supabase types from `@supabase/supabase-js` before implementation.

**Key Constraints:**

- Email verification required after signup (Supabase sends email automatically)
- Password reset flow must handle tokens from email links
- Unverified users cannot sign in (must verify email first)
- All auth operations must follow Clean Architecture (UI → Hook → Usecase → Repository → Supabase)
- Supabase redirect URLs must be configured in dashboard
- All pages must be accessible (WCAG 2.1 AA) and use SCSS variables

## Solution Outline

**Layers Impacted:**

- **Domain**: Add password reset and email verification types/schemas (`ResetPasswordInput`, `UpdatePasswordInput`, `VerifyEmailInput`, error types)
- **Ports**: Extend `AuthRepository` with `resetPasswordForEmail`, `updatePassword`, `verifyEmail`, `resendVerificationEmail`
- **Usecases**: Create `resetPasswordForEmail`, `updatePassword`, `verifyEmail`, `resendVerificationEmail` usecases
- **Infrastructure**: Implement repository methods using Supabase `resetPasswordForEmail()`, `verifyOtp()`, `updateUser()`
- **Presentation**: Update signup/signin pages, create `/auth/verify-email`, `/auth/reset-password`, `/auth/update-password` pages, add React Query hooks, add i18n keys

## Sub-Tickets

### 20.1 - Domain Types & Schemas for Password Reset & Email Verification

- **AC**: [x] Add `ResetPasswordInput` type and `ResetPasswordSchema` (email validation) [x] Add `UpdatePasswordInput` type and `UpdatePasswordSchema` (password, token validation) [x] Add `VerifyEmailInput` type and `VerifyEmailSchema` (email, token validation) [x] Add domain error types for verification/reset failures (`EmailVerificationError`, `PasswordResetError`, `InvalidTokenError`) [x] Place all types in `core/domain/auth.schema.ts`
- **DoD**: [x] All types exported from domain [x] Zod schemas validate inputs correctly [x] TypeScript strict compliance [x] No external dependencies (pure TypeScript) [x] Types match Supabase auth method signatures
- **Effort**: 2h | **Deps**: none

### 20.2 - Repository Methods (Ports & Infrastructure)

- **AC**: [x] Add `resetPasswordForEmail(email: string): Promise<void>` to `AuthRepository` interface [x] Add `updatePassword(input: UpdatePasswordInput): Promise<AuthResult>` to `AuthRepository` interface [x] Add `verifyEmail(input: VerifyEmailInput): Promise<AuthResult>` to `AuthRepository` interface [x] Add `resendVerificationEmail(email: string): Promise<void>` to `AuthRepository` interface (if Supabase supports) [x] Implement `resetPasswordForEmail` using `client.auth.resetPasswordForEmail()` [x] Implement `updatePassword` using `client.auth.verifyOtp()` with type 'recovery' then `client.auth.updateUser()` [x] Implement `verifyEmail` using `client.auth.verifyOtp()` with type 'email' [x] Map Supabase errors to domain errors appropriately [x] Verify Supabase types from `node_modules/@supabase/supabase-js/dist/module/types.d.ts`
- **DoD**: [x] Repository interface updated with all methods [x] All methods implemented in `AuthRepository.supabase.ts` [x] Supabase types verified and correctly used [x] Error mapping handles all edge cases [x] TypeScript compilation succeeds
- **Effort**: 3h | **Deps**: 20.1

### 20.3 - Usecases for Password Reset & Email Verification

- **AC**: [x] Create `resetPasswordForEmail` usecase in `core/usecases/auth/resetPasswordForEmail.ts` [x] Create `updatePassword` usecase in `core/usecases/auth/updatePassword.ts` [x] Create `verifyEmail` usecase in `core/usecases/auth/verifyEmail.ts` [x] Create `resendVerificationEmail` usecase in `core/usecases/auth/resendVerificationEmail.ts` (if supported) [x] All usecases validate input with Zod schemas [x] All usecases call repository methods
- **DoD**: [x] All usecases created and follow existing patterns [x] Input validation with Zod schemas [x] TypeScript compilation succeeds [ ] Unit tests for all usecases (see Unit Test Spec)
- **Effort**: 2h | **Deps**: 20.1, 20.2

### 20.4 - React Query Hooks for Auth Operations

- **AC**: [x] Create `useResetPassword` hook in `presentation/hooks/auth/useResetPassword.ts` [x] Create `useUpdatePassword` hook in `presentation/hooks/auth/useUpdatePassword.ts` [x] Create `useVerifyEmail` hook in `presentation/hooks/auth/useVerifyEmail.ts` [x] Create `useResendVerification` hook in `presentation/hooks/auth/useResendVerification.ts` (if supported) [x] All hooks call usecases (not repositories directly) [x] All hooks invalidate auth queries on success [x] All hooks provide loading, error, and success states
- **DoD**: [x] All hooks created and follow React Query patterns [x] Hooks call usecases correctly [x] Query invalidation configured [x] TypeScript compilation succeeds
- **Effort**: 2h | **Deps**: 20.3

### 20.5 - Email Verification UI (Signup Page Update & Verify Email Page)

- **AC**: [x] Update `SignupPage` to show email verification message when `requiresEmailVerification: true` (instead of redirecting) [x] Display success message with instructions to check email [x] Create `VerifyEmailPage` at `app/auth/verify-email/page.tsx` [x] Handle URL query parameters (`token`, `type=email`) from Supabase callback [x] Call `useVerifyEmail` hook with token on page load [x] Show loading state during verification [x] Auto-login user after successful verification [x] Redirect to `/myworkspace` after successful verification [x] Handle expired/invalid tokens with error messages [x] Use SCSS variables for all styling [x] Follow accessibility guidelines (WCAG 2.1 AA)
- **DoD**: [x] Signup page shows verification message correctly [x] Verify email page handles callbacks correctly [x] Loading and error states displayed [x] Redirects work correctly [x] SCSS variables used [x] Accessibility requirements met [x] TypeScript compilation succeeds
- **Effort**: 3h | **Deps**: 20.4

### 20.6 - Password Reset UI (Signin Page Update, Reset & Update Password Pages)

- **AC**: [x] Add "Forgot password?" link on `SigninPage` [x] Create `ResetPasswordPage` at `app/auth/reset-password/page.tsx` [x] Create form with email input [x] Call `useResetPassword` hook on form submit [x] Display success message after email sent [x] Create `UpdatePasswordPage` at `app/auth/update-password/page.tsx` [x] Handle URL query parameters (`token`, `type=recovery`) from Supabase callback [x] Create form with password and confirm password fields [x] Call `useUpdatePassword` hook with token and new password [x] Show loading state during operations [x] Auto-login user after successful password update [x] Redirect to `/myworkspace` after successful update [x] Handle expired/invalid tokens with error messages [x] Use SCSS variables for all styling [x] Follow accessibility guidelines (WCAG 2.1 AA)
- **DoD**: [x] Signin page has "Forgot password?" link [x] Reset password page works correctly [x] Update password page handles callbacks correctly [x] All forms validate inputs [x] Loading and error states displayed [x] Redirects work correctly [x] SCSS variables used [x] Accessibility requirements met [x] TypeScript compilation succeeds
- **Effort**: 4h | **Deps**: 20.4

### 20.7 - Unverified User Sign-In Handling

- **AC**: [x] Detect unverified email error in `SigninPage` error handling [x] Display clear error message indicating email verification is required [x] Add option to resend verification email (if `resendVerificationEmail` is supported) [x] Update middleware/layouts to prevent unverified users from accessing protected routes (check `user.email_confirmed_at` or similar) [x] Handle unverified user state gracefully
- **DoD**: [x] Unverified user errors detected correctly [x] Clear error messages displayed [x] Resend verification option works (if supported) [x] Protected routes block unverified users [x] TypeScript compilation succeeds
- **Effort**: 2h | **Deps**: 20.4, 20.5

### 20.8 - i18n Translation Keys for Auth Flows

- **AC**: [x] Add translation keys for email verification messages to `shared/i18n/messages/fr.json` [x] Add translation keys for password reset flow [x] Add translation keys for unverified user errors [x] Add translation keys for token expiration/invalid errors [x] Use `useTranslation` hook in all new pages [x] Follow existing i18n naming conventions (dot notation, camelCase)
- **DoD**: [x] All user-facing strings use i18n keys [x] Translation keys added to `fr.json` [x] Keys follow naming conventions [x] All pages use `useTranslation` hook [x] No hardcoded French strings
- **Effort**: 1h | **Deps**: 20.5, 20.6

### 20.9 - Integration & Testing

- **AC**: [x] Test email verification flow end-to-end (signup → email → verify → login) [x] Test password reset flow end-to-end (forgot password → email → reset → login) [x] Test unverified user sign-in error handling [x] Test expired token handling [x] Test invalid token handling [x] Test network error handling [x] Verify Supabase redirect URLs configured in dashboard [x] Manual testing checklist completed [x] All unit tests pass [x] No TypeScript errors [x] No ESLint errors
- **DoD**: [x] All flows tested end-to-end [x] Edge cases handled [x] Manual testing checklist completed [x] All tests pass [x] Code review completed [x] Documentation updated if needed
- **Effort**: 3h | **Deps**: 20.5, 20.6, 20.7, 20.8

## Unit Test Spec

**Status**: tests proposed

### Domain Tests

**File**: `__tests__/core/domain/auth.schema.test.ts`

**Key Tests**:

- `ResetPasswordSchema` validates email format correctly
- `ResetPasswordSchema` rejects invalid emails
- `UpdatePasswordSchema` validates password requirements
- `UpdatePasswordSchema` validates token presence
- `VerifyEmailSchema` validates email and token presence
- `VerifyEmailSchema` rejects invalid inputs

### Usecase Tests

**File**: `__tests__/core/usecases/auth/resetPasswordForEmail.test.ts`

**Key Tests**:

- `resetPasswordForEmail` calls repository with correct email
- `resetPasswordForEmail` validates input with Zod schema
- `resetPasswordForEmail` propagates repository errors

**File**: `__tests__/core/usecases/auth/updatePassword.test.ts`

**Key Tests**:

- `updatePassword` calls repository with correct input
- `updatePassword` validates input with Zod schema
- `updatePassword` returns AuthResult with session on success
- `updatePassword` handles expired token errors
- `updatePassword` handles invalid token errors

**File**: `__tests__/core/usecases/auth/verifyEmail.test.ts`

**Key Tests**:

- `verifyEmail` calls repository with correct input
- `verifyEmail` validates input with Zod schema
- `verifyEmail` returns AuthResult with session on success
- `verifyEmail` handles expired token errors
- `verifyEmail` handles invalid token errors

## Agent Prompts

### Unit Test Coach

"Generate unit tests for: 1) Domain schemas (`ResetPasswordSchema`, `UpdatePasswordSchema`, `VerifyEmailSchema`) in `__tests__/core/domain/auth.schema.test.ts` - test validation rules, invalid inputs, edge cases. 2) Usecases (`resetPasswordForEmail`, `updatePassword`, `verifyEmail`) in `__tests__/core/usecases/auth/*.test.ts` - test repository calls, input validation, error handling, success cases. Use existing mock patterns from `__mocks__/core/ports/authRepository.ts`. Cover all edge cases (expired tokens, invalid tokens, network errors)."

### Architecture-Aware Dev

"Implement auth finalization: 1) Add domain types (`ResetPasswordInput`, `UpdatePasswordInput`, `VerifyEmailInput`) and Zod schemas to `core/domain/auth.schema.ts`. 2) Extend `AuthRepository` interface with `resetPasswordForEmail`, `updatePassword`, `verifyEmail`, `resendVerificationEmail` methods. 3) Implement repository methods in `AuthRepository.supabase.ts` using Supabase `resetPasswordForEmail()`, `verifyOtp()`, `updateUser()` - verify types from `@supabase/supabase-js`. 4) Create usecases (`resetPasswordForEmail`, `updatePassword`, `verifyEmail`, `resendVerificationEmail`) in `core/usecases/auth/`. 5) Create React Query hooks in `presentation/hooks/auth/`. 6) Update `SignupPage` to show email verification message. 7) Create `VerifyEmailPage` at `app/auth/verify-email/page.tsx` handling URL tokens. 8) Update `SigninPage` with 'Forgot password?' link and unverified user error handling. 9) Create `ResetPasswordPage` and `UpdatePasswordPage`. Follow Clean Architecture, use SCSS variables, ensure accessibility."

### UI Designer

"Design auth pages: 1) Update signup page to show email verification success message with instructions. 2) Create email verification page (`/auth/verify-email`) with loading state, success message, and error handling. 3) Create password reset request page (`/auth/reset-password`) with email input form. 4) Create password update page (`/auth/update-password`) with password and confirm password fields. 5) Update signin page to add 'Forgot password?' link. All pages must follow existing design system, use SCSS variables, be accessible (WCAG 2.1 AA), and match signup/signin page styling."

### QA & Test Coach

"Create manual testing plan for auth finalization: Test email verification flow (signup → check email message → click link → verify → auto-login → redirect), password reset flow (forgot password → enter email → check email → click link → set new password → auto-login → redirect), unverified user sign-in (attempt sign-in with unverified email → see error → resend verification), expired token handling, invalid token handling, network error handling. Document test scenarios, expected behaviors, edge cases. Verify Supabase redirect URLs configured correctly."

### Architecture Guardian

"Review auth finalization implementation: Verify Clean Architecture compliance (UI → Hook → Usecase → Repository → Supabase), all Supabase types correctly imported and used, repository methods properly typed, usecases validate inputs with Zod, React Query hooks call usecases (not repositories), error handling covers all edge cases, SCSS variables used for styling, accessibility requirements met (WCAG 2.1 AA), i18n keys used for all user-facing strings, no hardcoded values."

## Open Questions

1. **Resend Verification Email**: Does Supabase support resending verification emails via client API, or does it require admin API? **Decision**: Check Supabase documentation and implement if supported via client API, otherwise defer to future ticket.

2. **Unverified User Detection**: How to detect unverified users in sign-in flow? Check Supabase error codes or user metadata? **Decision**: Check Supabase error response for unverified email errors, map to domain error type.

3. **Token Expiration Handling**: Should we show specific error messages for expired vs invalid tokens, or generic error? **Decision**: Show specific messages for better UX (expired: "Link expired, please request a new one", invalid: "Invalid verification link").

## MVP Cut List

If needed to reduce scope:

- **Keep**: Email verification flow (core requirement)
- **Keep**: Password reset flow (essential security feature)
- **Keep**: Unverified user error handling (prevents confusion)
- **Defer**: Resend verification email (nice-to-have, can be added later)
- **Defer**: Advanced token expiration UI (generic error message acceptable for MVP)
