# Git Commit Message Conventions

This document defines the commit message conventions used in this project. All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

The commit message must follow this format:

```
type(scope): subject

[optional body]

[optional footer(s)]
```

### Type

The `type` is required and must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope

The `scope` is optional and should be the area of the codebase affected:

- **domain**: Domain layer changes
- **usecases**: Use cases layer changes
- **infrastructure**: Infrastructure layer changes
- **presentation**: Presentation layer changes (components, hooks, stores)
- **shared**: Shared utilities and constants
- **config**: Configuration files (eslint, prettier, typescript, etc.)
- **deps**: Dependencies updates

### Subject

The `subject` is required and contains a short description of the change:

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Maximum 72 characters

### Body

The `body` is optional and used to provide additional contextual information:

- Explain the "what" and "why" vs. "how"
- Wrap at 72 characters
- Separate from the subject with a blank line

### Footer

The `footer` is optional and used to reference issues and breaking changes:

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Commit Types Examples

#### feat - New Feature

```
feat(auth): add user authentication with Supabase

Implement sign-in and sign-up functionality using Supabase Auth.
Add authentication hooks and store for managing user session.
```

#### fix - Bug Fix

```
fix(products): resolve product list pagination issue

Fix pagination not working correctly when filtering products.
The issue was caused by incorrect offset calculation.
```

#### docs - Documentation

```
docs(architecture): update Clean Architecture documentation

Add examples of proper layer separation and data flow.
Clarify repository pattern implementation.
```

#### style - Code Style

```
style(components): format code with Prettier

Apply Prettier formatting to all component files.
No functional changes.
```

#### refactor - Code Refactoring

```
refactor(usecases): extract validation logic to domain

Move product validation rules from usecases to domain layer.
Improve separation of concerns and testability.
```

#### test - Tests

```
test(domain): add unit tests for product validation

Add comprehensive test coverage for product domain rules.
Test edge cases and boundary conditions.
```

#### chore - Maintenance

```
chore(deps): update Next.js to version 14.2.0

Update Next.js and related dependencies to latest versions.
No breaking changes in this update.
```

### Examples with Scope

```
feat(presentation): add product search component

Create ProductSearch component with debounced input.
Add search functionality to product list page.
```

```
fix(infrastructure): correct Supabase query error handling

Handle network errors properly in product repository.
Return meaningful error messages to usecases.
```

```
refactor(shared): extract validation utilities

Move common validation functions to shared utilities.
Improve code reusability across layers.
```

### Examples without Scope

```
feat: add dark mode support

Implement theme switching functionality.
Add theme provider and persist user preference.
```

```
fix: resolve memory leak in React Query hooks

Fix missing cleanup in useProducts hook.
Prevent memory leaks when component unmounts.
```

```
docs: update README with setup instructions

Add detailed setup steps for new developers.
Include environment variable configuration.
```

### Breaking Changes

For breaking changes, include `BREAKING CHANGE:` in the footer:

```
feat(api): change authentication endpoint structure

Migrate from REST to GraphQL API endpoints.
Update authentication flow to use new endpoint.

BREAKING CHANGE: Authentication endpoints have changed.
Old endpoints are deprecated and will be removed in v2.0.
Update your authentication code to use the new GraphQL API.
```

```
refactor(domain): rename Product type to ProductEntity

Rename Product type to ProductEntity for clarity.
Align with Clean Architecture naming conventions.

BREAKING CHANGE: Product type renamed to ProductEntity.
Update all imports from 'core/domain/product' to use ProductEntity.
```

### Multiple Footer Notes

```
fix(infrastructure): handle Supabase connection errors

Improve error handling for network failures.
Add retry logic for transient errors.

Fixes #123
Closes #456
Refs #789
```

## Best Practices

1. **Be Descriptive**: Write clear, concise commit messages that explain why the change was made
2. **One Logical Change per Commit**: Keep commits focused on a single logical change
3. **Use Imperative Mood**: Write as if completing the sentence "If applied, this commit will..."
4. **Reference Issues**: Link commits to issues when applicable
5. **Document Breaking Changes**: Always document breaking changes clearly
6. **Separate Concerns**: Don't mix different types of changes (e.g., don't fix a bug and add a feature in the same commit)

## Commit Message Examples by Type

### feat

```
feat(usecases): add product creation usecase
feat(presentation): implement product search UI
feat(infrastructure): add Supabase product repository
feat: add user authentication flow
```

### fix

```
fix(domain): correct stock calculation logic
fix(presentation): resolve modal focus trap issue
fix(infrastructure): handle Supabase timeout errors
fix: resolve memory leak in React hooks
```

### docs

```
docs(architecture): document repository pattern
docs(README): add installation instructions
docs(usecases): add JSDoc for product usecases
```

### style

```
style(components): format with Prettier
style(domain): fix linting errors
style: apply consistent code formatting
```

### refactor

```
refactor(usecases): extract validation to domain
refactor(presentation): simplify component structure
refactor(infrastructure): improve error handling
```

### test

```
test(domain): add product validation tests
test(usecases): add product creation tests
test(infrastructure): add repository mock tests
```

### chore

```
chore(deps): update dependencies
chore(config): update ESLint rules
chore: update project documentation
```

## Enforcement

While Git hooks for enforcing these conventions are not configured in the MVP (see ticket 3.4 for future enhancement), all developers should follow these conventions to maintain a clean and consistent commit history.

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

