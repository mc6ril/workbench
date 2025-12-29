---
Generated: 2025-01-27 20:35:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-24
---

# Implementation Plan: Standardize Presentation Hooks Naming Convention

## Summary

Refactor presentation hooks to follow standardized `useProject*` naming convention for project-scoped data. Rename `useTickets` to `useProjectTickets`, create `useProjectEpics` and `useProjectMembers` hooks, update query keys, and migrate all usages. This prevents generic hooks from growing unmanageable and improves code clarity.

**Key constraints**: Maintain backward compatibility during migration, all hooks must follow Clean Architecture (call usecases), hooks accept `projectId` as first parameter, optional filters parameter for filtering support.

## Solution Outline

- **Presentation Layer** (`presentation/hooks/`): Refactor `useTickets` → `useProjectTickets`, create `useProjectEpics` and `useProjectMembers` hooks
- **Query Keys** (`presentation/hooks/queryKeys.ts`): Update to hierarchical pattern `["projects", projectId, "tickets"]`
- **Core Layer** (`core/usecases/`): Verify/create epic and member usecases if needed
- **Infrastructure Layer** (`infrastructure/supabase/`): Verify/create epic and member repositories if needed
- **Pages** (`app/`): Update all hook usages to new naming convention

## Sub-Tickets

### 24.1 - Update Query Keys for Project-Scoped Hooks

- AC: [ ] Update `queryKeys.ts` to add `epics` and `members` sections [ ] Ensure hierarchical pattern: `["projects", projectId, "tickets"]`, `["projects", projectId, "epics"]`, `["projects", projectId, "members"]` [ ] Maintain existing query keys for backward compatibility during migration
- DoD: [ ] Query keys updated [ ] TypeScript types correct [ ] No breaking changes
- Effort: 1h | Deps: [none]

### 24.2 - Refactor useTickets to useProjectTickets

- AC: [ ] Rename `useTickets.ts` to `useProjectTickets.ts` in `presentation/hooks/ticket/` [ ] Update hook signature to `useProjectTickets(projectId: string, filters?: TicketFilters)` [ ] Update query key to use `queryKeys.projects.tickets(projectId)` [ ] Update hook documentation and JSDoc [ ] Update exports in `index.ts`
- DoD: [ ] Hook renamed and refactored [ ] Documentation updated [ ] TypeScript types correct [ ] No functionality changes
- Effort: 1h | Deps: [24.1]

### 24.3 - Create useProjectEpics Hook

- AC: [ ] Verify/create `listEpics` usecase in `core/usecases/epic/` [ ] Verify/create `epicRepository` in `infrastructure/supabase/` [ ] Create `useProjectEpics.ts` in `presentation/hooks/epic/` following same pattern as `useProjectTickets` [ ] Hook accepts `projectId` as first parameter [ ] Add to exports in `index.ts`
- DoD: [ ] Hook created [ ] Follows Clean Architecture [ ] Query key uses hierarchical pattern [ ] Documentation added
- Effort: 3h | Deps: [24.1, epic usecase/repository if needed]

### 24.4 - Create useProjectMembers Placeholder Hook

- AC: [ ] Create `useProjectMembers.ts` in `presentation/hooks/project/` (or new `member/` directory) [ ] Hook accepts `projectId` as first parameter [ ] Minimal implementation (placeholder for future) [ ] Document as "future implementation" in JSDoc [ ] Add to exports in `index.ts`
- DoD: [ ] Hook created [ ] Follows naming convention [ ] Documented as placeholder [ ] TypeScript types correct
- Effort: 1h | Deps: [24.1]

### 24.5 - Update All Hook Usages

- AC: [ ] Find all usages of `useTickets` in codebase [ ] Update to `useProjectTickets(projectId)` [ ] Verify `useProject` usage matches convention [ ] Update any TypeScript types if needed [ ] Verify no breaking changes in functionality
- DoD: [ ] All usages updated [ ] No TypeScript errors [ ] No functionality regressions [ ] All tests pass
- Effort: 2h | Deps: [24.2]

### 24.6 - Update Hook Documentation and Naming Convention

- AC: [ ] Update JSDoc comments for all hooks to reflect new naming convention [ ] Document naming convention pattern in hooks README or inline comments [ ] Add examples of proper hook usage [ ] Update any architecture documentation
- DoD: [ ] Documentation updated [ ] Naming convention documented [ ] Examples provided
- Effort: 1h | Deps: [24.2, 24.3, 24.4]

## Unit Test Spec

**File**: `__tests__/presentation/hooks/ticket/useProjectTickets.test.tsx` (if needed)

**Key test names**:
- `should fetch tickets for a project`
- `should use correct query key with projectId`
- `should be disabled when projectId is empty`
- `should handle optional filters parameter` (future)

**Status**: tests proposed

**Note**: Since this is a refactoring task (renaming), existing functionality should remain the same. Tests may need updates to reflect new hook name, but no new test logic required unless filters parameter is added.

## Agent Prompts

- **Unit Test Coach**: "Generate unit test spec for `useProjectTickets` hook refactoring. Test query key structure, projectId parameter, and disabled state. Status: tests proposed."

- **Architecture-Aware Dev**: "Refactor `useTickets` to `useProjectTickets` following standardized naming convention. Update query keys, hook signature, and all usages. Maintain Clean Architecture: hooks call usecases, not infrastructure directly."

- **UI Designer**: N/A (no UI changes)

- **QA & Test Coach**: "Verify all hook usages updated correctly, no functionality regressions, TypeScript types correct, query keys follow hierarchical pattern."

## Open Questions

1. **Epic usecase/repository**: Do epic usecases and repositories already exist, or should they be created as part of this ticket? (Check `core/usecases/epic/` and `infrastructure/supabase/`)

2. **Member usecase/repository**: Should `useProjectMembers` be a complete implementation or minimal placeholder? (Ticket says placeholder, but verify if member usecases exist)

3. **Filters parameter**: Should `useProjectTickets` filters parameter be implemented now or left as TypeScript type for future? (Ticket mentions "future filtering support")

## MVP Cut List

- **Can defer**: `useProjectMembers` implementation (keep as minimal placeholder)
- **Can defer**: Filters parameter implementation in `useProjectTickets` (keep as TypeScript type only)
- **Can defer**: Epic usecase/repository creation if they don't exist (create minimal placeholder hook)

## Risk Notes

- **Low risk**: Renaming hooks is straightforward, but need to ensure all usages are found and updated
- **Medium risk**: If epic/member usecases don't exist, may need to create them (adds complexity)
- **Low risk**: Query key changes should maintain backward compatibility during migration

