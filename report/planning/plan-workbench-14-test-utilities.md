---
Generated: 2025-12-23 11:06:56
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-14
---

# Implementation Plan: Create Test Utilities

## Summary

Goal: Create shared test utilities (helpers, render functions, mock/data builders) to make unit and component tests concise, consistent, and aligned with the project’s Clean Architecture.

Constraints: Utilities must live outside production code (under `__tests__/` / `__mocks__/`), remain framework-agnostic where possible, and must not introduce business logic or break layer boundaries.

## Solution Outline

- Domain: helpers to create domain entities and input data for tests
- Usecases: helpers to build mocked repositories and invoke usecases ergonomically
- Infrastructure: optional mock factories for repositories/Supabase via `__mocks__` or test utils
- Presentation: render helpers for UI components with common providers (React Query, Zustand, etc.)

## Sub-Tickets

### 14.1 - Create Test Utilities Directory Structure

- AC: [x] `__tests__/utils/` directory created [x] Subdirectories for `core/`, `presentation/`, and `infrastructure/` helpers created if needed [x] `.gitkeep` files added to empty utility folders
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 0.5h | Deps: 16 (`__tests__` structure)

### 14.2 - Create Domain and Usecase Data Builders

- AC: [x] Utility functions to build core domain entities for tests created [x] Helpers to generate valid/invalid inputs for usecases created [x] Used in at least one existing or sample test
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 1h | Deps: none (or future domain modeling tickets)

### 14.3 - Create Render Helper for UI Components

- AC: [ ] `renderWithProviders` (or équivalent) created under `__tests__/utils/` [ ] Helper wraps components with common providers (React Query, Zustand providers, etc.) [ ] Sample UI test updated to use the helper
- DoD: [ ] Tests [ ] A11y [ ] SCSS vars
- Effort: 1h | Deps: 13 (RTL), 15 (mocks), 16 (`__tests__` structure)

### 14.4 - Create Mock Factories for Repositories and Supabase

- AC: [ ] Simple factory functions to create mocked repositories (e.g. `createTicketRepositoryMock`) created [ ] Optional helpers to obtain a mocked Supabase client for tests (reusing `__mocks__/supabase` une fois disponible) [ ] At least one usecase test refactored pour utiliser ces factories
- DoD: [ ] Tests [ ] A11y [ ] SCSS vars
- Effort: 1h | Deps: 15 (Mock infrastructure)

## Unit Test Spec

- File paths (exemples) :
  - `__tests__/utils/domain/exampleEntityBuilder.test.ts`
  - `__tests__/utils/renderWithProviders.test.tsx`
- Key tests :
  - data builders produisent des entités valides et faciles à surcharger (override de champs)
  - `renderWithProviders` monte bien les providers requis et permet d’utiliser les hooks/contexts
  - mocks/factories peuvent être configurés par test (par ex. retour différent suivant les cas)
- Status: tests proposed

## Agent Prompts

### Unit Test Coach

Proposer des tests pour les utilitaires de test (data builders, render helpers, mocks) afin de s’assurer qu’ils restent simples à utiliser, stables et qu’ils couvrent les cas principaux (valide, invalide, erreurs).

### Architecture-Aware Dev

Créer les dossiers et modules de test utilities sous `__tests__/utils/`, implémenter des helpers pour construire des entités/mocks et pour rendre des composants avec les providers nécessaires, puis refactorer au moins un test de usecase et un test de composant pour les utiliser.

### UI Designer

Valider que les helpers de rendu pour les composants UI permettent d’activer facilement les contraintes d’accessibilité (par exemple, provider d’`a11y` ou de theming) pour que les tests reflètent l’UX réelle.

### QA & Test Coach

Définir une courte stratégie de réutilisation des utilitaires de test (quand utiliser un builder, quand utiliser un mock explicite, comment structurer les tests) et vérifier que la nouvelle structure de tests reste simple à comprendre pour l’équipe.

## Open Questions

1. Faut-il introduire une convention stricte de nommage pour les builders/mocks (par ex. `createXxxBuilder`, `createXxxMock`) ?
2. Jusqu’où aller dans la factorisation (ne pas sur-abstraire au détriment de la lisibilité des tests) ?
3. Où documenter ces utilitaires (README dans `__tests__/utils/`, page dédiée dans `docs/testing`…) ?
