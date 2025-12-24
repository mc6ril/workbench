---
Generated: 2025-12-23 10:51:13
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-13
---

# Implementation Plan: Setup React Testing Library

## Summary

Goal: Install and configure React Testing Library (RTL) with Jest and TypeScript to enable component-level tests for reusable UI components focusing on user interactions and accessibility.

Constraints: Must integrate with existing Jest + ts-jest setup, respect Clean Architecture (tests live in `__tests__/presentation/components/ui/`), and avoid coupling tests directly to infrastructure.

## Solution Outline

- Domain: none (tests target UI behavior, not domain rules)
- Usecases: none (indirectly exercised via hooks/components later)
- Infrastructure: none
- Presentation: reusable UI components in `presentation/components/ui/`, test helpers under `__tests__/`

## Sub-Tickets

### 13.1 - Install React Testing Library Dependencies

- AC: [x] `@testing-library/react` and `@testing-library/jest-dom` installed [x] Packages added to devDependencies [x] Versions compatible with React 19 and Jest config
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 0.5h | Deps: 12 (Jest config)

### 13.2 - Configure RTL and Jest Integration

- AC: [x] RTL setup file created (e.g. `__tests__/setupTests.ts`) [x] Jest config updated to use setup file (`setupFilesAfterEnv`) [x] `@testing-library/jest-dom` matchers available globally
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 0.5h | Deps: 13.1

### 13.3 - Add Sample UI Component Test

- AC: [x] Simple reusable UI component in `presentation/components/ui/` tested with RTL [x] Test located under `__tests__/presentation/components/ui/` [x] Test covers basic rendering and user interaction
- DoD: [x] Tests [x] A11y [x] SCSS vars
- Effort: 0.5h | Deps: 13.1, 13.2

## Unit Test Spec

- File path: `__tests__/presentation/components/ui/<SampleComponent>.test.tsx`
- Key tests:
  - renders component with required props
  - responds to user interaction (e.g. click, change)
  - applies accessibility attributes correctly (role, aria-label, etc.)
- Status: tests proposed

## Agent Prompts

### Unit Test Coach

Write RTL-based test specs for a simple reusable UI component in `presentation/components/ui/` (e.g. a Button), focusing on rendering, user interaction, and basic accessibility attributes, to be placed under `__tests__/presentation/components/ui/`.

### Architecture-Aware Dev

Install `@testing-library/react` and `@testing-library/jest-dom`, configure Jest with a `setupTests` file to register RTL and jest-dom, and create a sample test for a reusable UI component under `__tests__/presentation/components/ui/`.

### UI Designer

Ensure the sample reusable UI component used for RTL tests follows the design and accessibility guidelines (proper roles, labels, focus states) so that tests validate realistic UI behavior.

### QA & Test Coach

Define a minimal test plan for RTL-based component tests, including rendering, basic user flows, and accessibility checks, and verify that `yarn test` runs the new RTL tests successfully.

## Open Questions

1. Which reusable UI component should be used as the reference example for RTL tests (Button, Input, or another core component)?
2. Should we enforce a naming convention for all future component tests (e.g. `*.test.tsx` under `__tests__/presentation/components/ui/`)?
3. Do we need additional custom Jest matchers or utilities beyond `@testing-library/jest-dom` for accessibility-focused assertions?
