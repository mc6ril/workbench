```mermaid
sequenceDiagram
participant User as 👤 User
participant Route as 📄 src/app/auth/update-password/page.tsx<br/>(routing only)
participant AuthPage as 🔐 domains/auth/presentation/pages/update-password<br/>(screen composition)
participant AuthHook as 🪝 domains/auth/presentation/hooks/useUpdatePassword.ts
participant Validation as 📋 domains/auth/core/domain/schema/
participant Usecase as ⚙️ domains/auth/core/usecases/updatePassword.ts
participant AuthRepo as 🗂️ domains/auth/infrastructure/supabase/AuthRepository.supabase.ts
participant Client as 🏗️ src/shared/infrastructure/supabase/client.ts
participant Supabase as ☁️ Supabase

    User->>Route: Open /auth/update-password?token=xxx&email=yyy
    Route->>AuthPage: Compose update-password page

    Note over AuthPage: 1. Initialize page and form state
    AuthPage->>Validation: Validate password + confirmPassword
    Validation-->>AuthPage: Valid or validation errors

    Note over AuthPage: 2. User submits new password
    User->>AuthPage: Submit form
    AuthPage->>AuthHook: mutate(payload)
    AuthHook->>Usecase: updatePassword(authRepository, payload)

    Note over Usecase: 3. Domain use case orchestrates the auth flow
    Usecase->>Validation: Validate payload again
    Validation-->>Usecase: Validated input
    Usecase->>AuthRepo: updatePassword(payload)

    Note over AuthRepo: 4. Domain infrastructure uses shared technical client
    AuthRepo->>Client: get browser auth client
    Client-->>AuthRepo: Supabase client
    AuthRepo->>Supabase: client.auth.updateUser({ password })
    Supabase-->>AuthRepo: Session / auth response
    AuthRepo-->>Usecase: Auth result
    Usecase-->>AuthHook: Success
    AuthHook-->>AuthPage: Success state

    Note over AuthPage: 5. Auth domain handles UX and handoff
    AuthPage-->>Route: Password updated
    Route->>User: Redirect to /workspace
```

# Notes

- In the target architecture, auth owns the password-update action itself.
- `src/app/` keeps the route entrypoint and composition only.
- Shared infrastructure in `src/shared/infrastructure/supabase/` provides technical clients, not auth business flows.
- Password reset validation, orchestration, and provider adaptation belong to the auth domain.
- The resulting authenticated identity state belongs to the `session` owner, not to `profile`.
- Account surfaces belong to `settings`, which may compose `viewer`, `profile`, `session`, and `auth` without making `auth` own all account UI.
