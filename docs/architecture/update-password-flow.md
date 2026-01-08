````mermaid
sequenceDiagram
participant User as 👤 Utilisateur
participant Page as 📄 page.tsx<br/>(Presentation)
participant FormSchema as 📋 UpdatePasswordFormSchema<br/>(Domain)
participant DomainSchema as 🔒 UpdatePasswordSchema<br/>(Domain)
participant Hook as 🪝 useUpdatePassword<br/>(Presentation)
participant Usecase as ⚙️ updatePassword<br/>(Usecase)
participant Port as 📝 AuthRepository<br/>(Port)
participant Infra as 🏗️ AuthRepository.supabase<br/>(Infrastructure)
participant Supabase as ☁️ Supabase

    User->>Page: Accède à /auth/update-password?token=xxx&email=yyy

    Note over Page: 1. Initialisation du formulaire
    Page->>FormSchema: useForm avec UpdatePasswordFormSchema
    FormSchema-->>Page: Validation schema pour {password, confirmPassword}

    Note over Page: 2. Utilisateur remplit le formulaire
    User->>Page: Saisit password + confirmPassword
    Page->>FormSchema: Validation en temps réel (onBlur)
    FormSchema-->>Page: ✅ Validation OK ou ❌ Erreurs

    Note over Page: 3. Soumission du formulaire
    User->>Page: Clique sur "Submit"
    Page->>Page: onSubmit() appelé

    Note over Page: 4. Transformation des données
    Page->>Page: Construit UpdatePasswordInput:<br/>{password, token, email}

    Note over Page: 5. Validation domaine (double validation)
    Page->>DomainSchema: UpdatePasswordSchema.parse(updatePasswordInput)
    DomainSchema-->>Page: ✅ Validation OK ou ❌ Erreur

    Note over Page: 6. Appel du hook React Query
    Page->>Hook: mutate(updatePasswordInput)
    Hook->>Usecase: updatePassword(repository, input)

    Note over Usecase: 7. Validation dans le usecase
    Usecase->>DomainSchema: UpdatePasswordSchema.parse(input)
    DomainSchema-->>Usecase: ✅ validatedInput

    Note over Usecase: 8. Appel du repository (via port)
    Usecase->>Port: repository.updatePassword(validatedInput)
    Note over Port: Contrat défini ici:<br/>updatePassword(input: UpdatePasswordInput)

    Port->>Infra: Implémentation Supabase
    Infra->>Supabase: client.auth.updateUser({password})
    Supabase-->>Infra: ✅ Session créée
    Infra-->>Port: AuthResult {session}
    Port-->>Usecase: AuthResult
    Usecase-->>Hook: AuthResult
    Hook-->>Page: Mutation success avec session
    Page->>User: Redirection vers /workspace
```
````
