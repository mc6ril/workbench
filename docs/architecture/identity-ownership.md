# Identity, Session, Profile, Viewer, and Settings Ownership

## Purpose

This document defines the target ownership model for everything related to the
current user.

The goal is to avoid mixing:

- authentication actions
- current identity state
- profile data
- app-level "current viewer" composition
- account/settings surface composition

## Target Owners

| Concern                   | Owner                   | Examples                                                             |
| ------------------------- | ----------------------- | -------------------------------------------------------------------- |
| Authentication actions    | `src/domains/auth/`     | `signIn`, `signOut`, `signUp`, OAuth, reset password, delete account |
| Current identity state    | `src/domains/session/`  | `userId`, `loginEmail`, `accessToken`, `canUpdatePassword`           |
| User business data        | `src/domains/profile/`  | `displayName`, `avatarUrl`, preferences                              |
| Current viewer read-model | `src/domains/viewer/`   | `useViewer()`, current-user display model                            |
| Account/settings surfaces | `src/domains/settings/` | `/account`, cross-owner settings composition                         |

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
- `canUpdatePassword`
- `isAuthenticated`

`viewer` must remain read-only:

- no repository ownership by default
- no auth mutations
- no profile mutations
- no business rules copied from `session` or `profile`

### `settings`

`settings` owns cross-owner settings surfaces such as `/account`.

It is a composition owner for settings screens, not an owner of identity or
profile data.

Typical composition for the account surface:

- `viewer` for the current-user read model
- `profile` for editable business data such as avatar and preferences
- `session` for identity state and auth-derived capabilities
- `auth` for mutations such as sign-out, password, and delete-account flows
- `billing` for subscription management

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
- account/settings page shell -> `settings`

## Current State

The current split is now explicit in the codebase:

- `auth` owns authentication mutations and action-oriented flows
- `session` owns current identity state and auth-derived capabilities
- `profile` owns user business data and profile mutations
- `viewer` owns read-only current-user composition
- `settings` owns `/account` and other cross-owner settings surfaces

## Migration Direction

1. Keep `auth` focused on mutations/actions.
2. Keep `session` as the owner of current identity state.
3. Keep `profile` focused on business profile data.
4. Keep `viewer` as the read-model consumed by most current-user UI.
5. Keep `/account` and similar cross-owner settings screens in `settings`.

## Related Documents

- `docs/architecture/user-flows.md`
- `docs/architecture/repositories.md`
- `docs/architecture/accepted-exceptions.md`
- `.cursor/docs/architecture.md`
