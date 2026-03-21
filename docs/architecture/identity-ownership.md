# Identity, Session, Profile, and Viewer Ownership

## Purpose

This document defines the target ownership model for everything related to the
current user.

The goal is to avoid mixing:

- authentication actions
- current identity state
- profile data
- app-level "current viewer" composition

## Target Owners

| Concern | Owner | Examples |
| --- | --- | --- |
| Authentication actions | `src/domains/auth/` | `signIn`, `signOut`, `signUp`, OAuth, reset password, delete account |
| Current identity state | `src/domains/session/` | `userId`, `loginEmail`, `accessToken`, `isSuperuser`, `canUpdatePassword` |
| User business data | `src/domains/profile/` | `displayName`, `avatarUrl`, preferences |
| Current viewer read-model | `src/domains/viewer/` | `useViewer()`, account-surface composition, current-user display model |

## Ownership Rules

### `auth`

`auth` owns mutations and action-oriented flows only.

Examples:

- sign in / sign out
- sign up
- OAuth redirect / callback completion
- reset password
- update password
- delete account

`auth` does **not** own the long-lived representation of the current user in
the app.

### `session`

`session` answers:

> Who is currently authenticated, and what auth-derived capabilities do they
> have?

Target fields:

- `userId`
- `loginEmail`
- `accessToken`
- `isSuperuser`
- `canUpdatePassword`

These values are identity/session/claim data, not profile data.

### `profile`

`profile` owns user business data that can be reused across the app:

- `displayName`
- `avatarUrl`
- theme / locale / notification preferences
- any future public or private user profile fields

`profile` may depend on session identity to know which profile to load, but it
must stay independent from auth mutations.

### `viewer`

`viewer` is a **read-model / composition owner**, not a business owner.

It aggregates current-user data from `session` and `profile` into one stable
surface for the rest of the app.

Examples of fields that may belong in `CurrentViewer`:

- `userId`
- `loginEmail`
- `displayName`
- `avatarUrl`
- `isSuperuser`
- `canUpdatePassword`
- `isAuthenticated`

`viewer` must remain read-only:

- no repository ownership by default
- no auth mutations
- no profile mutations
- no business rules copied from `session` or `profile`

## Important Guardrails

### 1. `accessToken` is never profile data

`accessToken` belongs to session/identity only.

It must not move into `profile`, and it should not be exposed broadly through
UI composition layers when not necessary.

### 2. `accessToken` should not travel through UI props

UI components should not receive tokens as props.

If a component needs a token directly, that is usually a signal that the flow
should be pushed down into infrastructure or an owner hook/use case.

### 3. `email` must be explicit

When the email in session represents the login identity, prefer naming it
`loginEmail` in the target architecture.

This avoids future ambiguity if profile later owns a separate contact email.

### 4. `viewer` must not become a god object

`viewer` composes and projects data.
It does not become the owner of auth, session, or profile behavior.

## Consumption Model

### Use `useViewer()` when the UI needs "the current user"

Most presentation code should eventually consume a viewer-shaped hook rather
than manually composing:

- `useSession()`
- `useMyProfile()`
- capability hooks such as `useCanUpdatePassword()`

### Use owner hooks directly when the screen is owner-specific

Examples:

- sign-in page -> `auth`
- password reset page -> `auth`
- profile editor internals -> `profile`
- session guard or auth gate -> `session`

## Current Transitional State

The current codebase is not fully migrated yet.

At the time of writing:

- `profile` already owns profile data and profile mutations
- `@/shared/profile` is the thin cross-domain bridge for current-profile access
- `@/shared/session` still re-exports `useSession()` from the auth domain
- some account-facing UI still composes `session`, `profile`, and auth actions
  directly

This is acceptable during migration, but new architectural decisions should
target the owner split described above.

## Migration Direction

1. Keep `auth` focused on mutations/actions.
2. Introduce `session` as the owner of current identity state.
3. Keep `profile` focused on business profile data.
4. Add `viewer` as the read-model consumed by most account/current-user UI.

## Related Documents

- `docs/architecture/user-flows.md`
- `docs/architecture/repositories.md`
- `docs/architecture/accepted-exceptions.md`
- `.cursor/docs/architecture.md`
