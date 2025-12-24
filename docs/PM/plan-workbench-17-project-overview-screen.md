---
Generated: 2025-01-XX
Ticket: 17
Type: Implementation Plan
---

# Implementation Plan: Project Overview & Access Management Screen

## Summary

Implement a project overview screen showing user's projects with roles, create project functionality (when user has no projects), and project access request. Most infrastructure exists; missing pieces: createProject usecase/hook, role display, and create form UI.

**Key Constraints:**

- RLS already filters projects to user's accessible projects
- User can only create project if they have no project access (enforced by RLS)
- Creator auto-added as admin via database trigger
- Request access works via `useAddUserToProject` (already implemented)

## Solution Outline

**Layers Impacted:**

- **Domain**: Extend `Project` schema to include optional `role` field OR create `ProjectWithRole` type
- **Usecases**: Create `createProject` usecase (wraps repository.create)
- **Infrastructure**: Enhance `listProjects` to optionally fetch roles OR fetch separately
- **Presentation**: Add `useCreateProject` hook, update home page with create form and role display

## Sub-Tickets

### 17.1 - Create Project Usecase & Hook

- AC: [x] `createProject` usecase validates input and calls repository.create [x] `useCreateProject` hook with mutation [x] Invalidates projects query on success [ ] Redirects to project page after creation (handled in UI component 17.3)
- DoD: [x] Unit tests for usecase [x] TypeScript types [x] Follows existing usecase pattern [x] Error handling
- Effort: 2h | Deps: none

### 17.2 - Display User Role in Project List

- AC: [x] Project list shows role (admin/member/viewer) for each project [x] Role fetched from project_members table [x] Role displayed next to project name
- DoD: [x] Repository method to fetch roles OR enhanced list with roles [x] Domain type updated if needed [x] UI displays role badge/label [x] A11y: role announced in screen reader
- Effort: 3h | Deps: none (may need repository enhancement)

### 17.3 - Create Project Form UI

- AC: [x] Form shown only when user has no projects (projects.length === 0) [x] Project name input field [x] Submit button triggers createProject mutation [x] Auto-redirect to project page on success [x] Error messages displayed
- DoD: [x] Uses existing Input/Button components [x] SCSS variables for styling [x] Form validation [x] Loading state during mutation [x] Error handling
- Effort: 3h | Deps: 17.1

### 17.4 - Enhance Home Page Integration

- AC: [x] Conditional rendering: show create form only if no projects [x] Request access section only shown if no projects [x] Projects list shows roles [x] All states handled (loading/error/empty/success)
- DoD: [x] Clean conditional logic [x] i18n translations added [x] SCSS variables used [x] A11y compliance [x] No linting errors
- Effort: 2h | Deps: 17.1, 17.2, 17.3

## Unit Test Spec

**File**: `__tests__/core/usecases/createProject.test.ts`

**Key Tests:**

1. `createProject` - should create project with valid input
2. `createProject` - should throw error on invalid input (empty name)
3. `createProject` - should propagate repository errors
4. `createProject` - should return created project

**Status**: tests proposed

## Agent Prompts

### Unit Test Coach

"Generate unit tests for `createProject` usecase at `src/core/usecases/createProject.ts`. Test validation, repository integration, and error handling. Follow existing usecase test patterns."

### Architecture-Aware Dev

"Implement `createProject` usecase and `useCreateProject` hook following Clean Architecture patterns. Repository.create exists. Add role display to project list (fetch from project_members or enhance repository.list). Update home page with create project form (conditional on no projects). Use existing UI components and SCSS variables."

### UI Designer

"Design create project form section for home page. Form should appear only when user has no projects. Include project name input, submit button, error display. Match existing signin/signup form styling. Ensure accessibility and responsive design."

### QA & Test Coach

"Create test plan for project overview screen: verify project list with roles, create project flow (form display, submission, redirect), request access flow, loading/error/empty states, conditional rendering logic. Test RLS enforcement (user can only see their projects)."

## Open Questions

1. **Role fetching strategy**: Should we enhance `repository.list()` to return `ProjectWithRole[]` (joins project_members) OR fetch roles separately in the usecase? Recommendation: Enhance repository for cleaner architecture.

2. **Domain type**: Create `ProjectWithRole` type or extend `Project` with optional `role`? Recommendation: Create `ProjectWithRole` to keep `Project` pure.

3. **Navigation target**: Redirect to `/projects/${id}` or `/projects/${id}/dashboard`? Current code uses `/projects/${id}` - confirm this route exists.

## MVP Cut List

If scope needs reduction:

- ✅ **Keep**: Project list display, create project form
- ⚠️ **Defer**: Role display (can add badge later)
- ✅ **Keep**: Request access (already implemented)
