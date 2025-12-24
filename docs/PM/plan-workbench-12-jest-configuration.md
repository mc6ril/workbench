---
Generated: 2025-12-23 00:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-12
---

### Summary

Configure Jest with TypeScript support as the unified unit test runner for domain, usecases, and reusable UI components, wired into the existing tooling and directory conventions without impacting the current build or lint pipelines.

Key constraints: strict TypeScript (no `any`), tests only in `__tests__/` and `__mocks__/` at project root, Clean Architecture layering (domain/usecases focus, no page tests), and alignment with existing npm/yarn scripts and tsconfig.

### Solution Outline

- **Domain / Usecases**:
  - Use Jest to run unit tests for pure domain logic and usecases, with coverage collection scoped to `src/core/domain` and `src/core/usecases`.
  - Ensure test files mirror source structure under `__tests__/core/domain` and `__tests__/core/usecases`.
- **Infrastructure**:
  - No direct tests; infrastructure is tested via mocked repositories in usecase tests.
  - Configure Jest moduleNameMapper to support `@/` paths so usecases can import domain/ports cleanly in tests.
- **Presentation**:
  - Prepare Jest and React Testing Library integration for reusable UI components under `presentation/components/ui` (tests under `__tests__/presentation/components/ui`).
- **Tooling / Config**:
  - Add Jest, `ts-jest`, and `@types/jest` as devDependencies.
  - Create `jest.config.ts` with:
    - `preset: "ts-jest"`, test environment `node` plus `jsdom` where needed.
    - Proper `roots`, `testMatch`, `moduleNameMapper` for `@/` and static assets.
    - Coverage configuration (include domain/usecases, exclude `src/app`, `node_modules`, `.next`, etc.).
  - Add `yarn test` (and optional `test:watch`) scripts to `package.json`.

### Sub-Tickets

```markdown
### 12.1 - Add Jest and TypeScript Testing Dependencies

- AC: [x] Jest, ts-jest, @types/jest installed as devDependencies [x] Lockfile updated and install succeeds without conflicts
- DoD: [x] Tests [ ] A11y [ ] SCSS vars
- Effort: 1h | Deps: [none]

### 12.2 - Create Base Jest Configuration (TypeScript, Paths, Coverage)

- AC: [x] `jest.config.ts` created with ts-jest preset and TS support [x] `moduleNameMapper` handles `@/` imports and static assets [x] Coverage includes `src/core/domain` and `src/core/usecases` only
- DoD: [x] Tests [ ] A11y [ ] SCSS vars
- Effort: 2h | Deps: [12.1]

### 12.3 - Align Jest with TypeScript and Project Structure (ts-jest, tsconfig)

- AC: [x] Jest uses existing `tsconfig.json` (or dedicated `tsconfig.jest.json` if needed) [x] Test file discovery restricted to `__tests__/` at project root [x] No tests or mocks are placed inside `src/`
- DoD: [x] Tests [ ] A11y [ ] SCSS vars
- Effort: 2h | Deps: [12.2]

### 12.4 - Add Initial Sample Tests for Domain and Usecases

- AC: [x] At least one domain test in `__tests__/core/domain` validating pure business logic [x] At least one usecase test in `__tests__/core/usecases` with mocked repository [x] `yarn test` passes with these sample tests
- DoD: [x] Tests [ ] A11y [ ] SCSS vars
- Effort: 3h | Deps: [12.3]

### 12.5 - Configure Jest Scripts and Update Documentation

- AC: [x] `yarn test` (and optional `yarn test:watch`) scripts added in `package.json` [x] README or `docs/plan.md` updated with how to run tests and where to place them [x] CI or existing pipelines can invoke `yarn test` without extra configuration
- DoD: [x] Tests [ ] A11y [ ] SCSS vars
- Effort: 1h | Deps: [12.4]
```

### Unit Test Spec

- **Initial focus**:
  - Domain example: choose a simple pure function or value object in `src/core/domain` (once available) for the first test.
  - Usecase example: pick a basic usecase in `src/core/usecases` that depends on a repository port, and mock the repository.
- **Proposed test files** (paths will be created as part of implementation):
  - `__tests__/core/domain/exampleDomain.test.ts`
  - `__tests__/core/usecases/exampleUsecase.test.ts`
- **Key test names**:
  - `"should compute expected domain value for valid input"`
  - `"should throw or handle error when domain input is invalid"`
  - `"should call repository with expected parameters in usecase"`
  - `"should map repository response to expected domain output"`
  - `"should handle repository error path in usecase"`
- **Status**: tests proposed (to be refined and approved by Unit Test Coach before coding)

### Agent Prompts

- **Unit Test Coach**:
  - "Given workbench-12 (Jest configuration), design concrete Jest test specs and file scaffolds for one domain function and one usecase under `__tests__/core/domain` and `__tests__/core/usecases`, ensuring alignment with Clean Architecture and no tests inside `src/`."
- **Architecture-Aware Dev**:
  - "Implement workbench-12 Jest configuration: add Jest/ts-jest/@types/jest, create `jest.config.ts` aligned with tsconfig and `@/` paths, enforce `__tests__/` structure, wire `yarn test`, and add minimal sample tests for domain and usecases."
- **UI Designer**:
  - "No direct UI changes for workbench-12; validate that future reusable UI components under `presentation/components/ui` can be tested via Jest + React Testing Library using the new configuration and propose any needed conventions."
- **QA & Test Coach**:
  - "Define a QA checklist for workbench-12 focusing on Jest integration: verify `yarn test` behavior, coverage over domain/usecases, absence of tests in `src/`, and compatibility with future React Testing Library usage and CI."

### Open Questions

1. Should we introduce a dedicated `tsconfig.jest.json` to keep Jest-specific TS options (e.g., isolatedModules) separate from the main `tsconfig.json`, or reuse the existing config initially for simplicity?
2. Do we want default minimum coverage thresholds (e.g., per-file or global) enforced now for `src/core/domain` and `src/core/usecases`, or postpone strict coverage gates to a later ticket?
