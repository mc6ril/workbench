````mermaid
sequenceDiagram
participant User as 👤 User
participant Route as 📄 src/app/auth/update-password/page.tsx<br/>(Routing)
participant AuthFlow as 🔐 Shared Auth Flow<br/>(src/shared/auth)
participant Validation as 📋 Password Validation<br/>(shared auth/schema utilities)
participant SessionUtils as 🧭 Session Utilities<br/>(src/shared/auth)
participant Infra as 🏗️ Shared Supabase Auth Adapter<br/>(src/shared/infrastructure/supabase)
participant Supabase as ☁️ Supabase

    User->>Route: Open /auth/update-password?token=xxx&email=yyy
    Route->>AuthFlow: Compose update-password screen

    Note over AuthFlow: 1. Initialize form state and auth flow context
    AuthFlow->>Validation: Validate password + confirmPassword
    Validation-->>AuthFlow: Valid or validation errors

    Note over AuthFlow: 2. User submits new password
    User->>AuthFlow: Submit form
    AuthFlow->>Validation: Validate payload again before mutation
    Validation-->>AuthFlow: Validated input

    Note over AuthFlow: 3. Shared auth flow executes password update
    AuthFlow->>SessionUtils: Build authenticated password-reset request
    SessionUtils-->>AuthFlow: Normalized auth payload

    Note over AuthFlow: 4. Shared infrastructure handles provider call
    AuthFlow->>Infra: updatePassword(payload)
    Infra->>Supabase: client.auth.updateUser({ password })
    Supabase-->>Infra: Session / auth response
    Infra-->>AuthFlow: Auth result

    Note over AuthFlow: 5. Route redirects after success
    AuthFlow-->>Route: Password updated
    Route->>User: Redirect to /workspace
````

# Notes

- In the new architecture, auth is treated as a **shared cross-cutting capability**, not as part of the `project-management` domain.
- `src/app/` keeps the route entrypoint.
- Shared auth/session logic lives in `src/shared/auth/`.
- Shared Supabase auth clients and adapters live in `src/shared/infrastructure/supabase/`.
