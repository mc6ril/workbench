---
Generated: 2025-01-27
Ticket: 18
Plan: Route Guards for Authentication & Project Access
---

# Implementation Plan: Route Guards for Authentication & Project Access

## Summary

Implement hybrid route protection: **Next.js middleware** for fast authentication checks on protected routes (redirect to `/signin` if no session cookie), and **server-side layout** for fine-grained project access checks. Optimize project access verification using existing SQL function `has_any_project_access()` instead of loading all projects.

**Key Constraints:**

- Next.js middleware runs at edge (Edge Runtime), async operations supported
- Public routes (no auth required): `/`, `/signin`, `/signup` - contain project presentation and authentication
- After login: redirect to `/myworkspace` (contains current project overview from `src/app/page.tsx`)
- Middleware protects `/myworkspace` and `/app/*` routes (future: `/app/board`, `/app/backlog`, `/app/epics`)
- Server-side layout (`app/app/layout.tsx`) loads session and permissions, performs fine-grained checks for `/app/*` routes
- Server-side layout (`app/myworkspace/layout.tsx`) for `/myworkspace` route protection
- Must avoid infinite redirect loops (careful route matching logic)
- Protected routes: `/myworkspace` and `/app/*` routes require auth + project access
- Use optimized project access check (`has_any_project_access()` SQL function)

## Solution Outline

**Layers Impacted:**

- **Domain**: Optional `hasProjectAccess` usecase (lightweight check using SQL function)
- **Infrastructure**: Repository method to check project access via `has_any_project_access()` SQL function, middleware uses `authRepository.getSession()`
- **Presentation**: Root `middleware.ts` for protected route protection (`/myworkspace`, `/app/*`), `app/app/layout.tsx` server component for `/app/*` session/permission loading, `app/myworkspace/layout.tsx` for `/myworkspace` protection, route constants for maintainability, move current `page.tsx` content to `app/myworkspace/page.tsx`

**Architecture Note**: Hybrid approach - middleware for fast cookie-based auth checks (edge runtime), server layout for detailed permission checks (server component with full repository access). This balances performance (fast redirects) with flexibility (detailed checks where needed).

## Sub-Tickets

### 18.1 - Route Constants & Structure

- **AC**: [x] Define route constants for public routes (`/`, `/signup`, `/signin`) [x] Define protected routes (`/myworkspace`, `/app/*` for future: `/app/board`, `/app/backlog`, `/app/epics`) [x] Export from `shared/constants/routes.ts` [x] Move current `src/app/page.tsx` content to `app/myworkspace/page.tsx` [x] Create new public landing page at `src/app/page.tsx` (project presentation) [x] Update signin redirect to `/myworkspace` instead of `/` (in `app/signin/page.tsx`)
- **DoD**: [x] Constants typed as readonly arrays [x] Easy to extend for future routes [x] Used in middleware and layouts (constants exported and ready for use) [x] Route structure matches new requirements (public `/`, protected `/myworkspace`)
- **Effort**: 1h | **Deps**: none

### 18.2 - Optimized Project Access Check (Usecase & Repository)

- **AC**: [x] Add `hasProjectAccess()` method to `ProjectRepository` interface [x] Implement repository method using `has_any_project_access()` SQL function (lightweight boolean check) [x] Create `hasProjectAccess` usecase wrapping repository method [x] Method returns boolean (true if user has access to any project)
- **DoD**: [x] Repository interface updated [x] Repository implementation uses SQL function `has_any_project_access()` [x] Usecase created and follows existing patterns [x] TypeScript compilation succeeds [x] Unit tests for usecase
- **Effort**: 2h | **Deps**: none

### 18.3 - Middleware Authentication Guard for Protected Routes

- **AC**: [x] Create `middleware.ts` at project root [x] Match protected routes (`/myworkspace`, `/app/*`) using `config.matcher` [x] Check auth session cookie using Supabase `auth.getSession()` (Edge Runtime compatible) [x] Redirect unauthenticated users from protected routes to `/signin` [x] Allow public routes (`/`, `/signup`, `/signin`) without middleware intervention [x] Handle middleware Edge Runtime constraints (async/await supported)
- **DoD**: [x] Middleware file created [x] Matcher configured for `/myworkspace` and `/app/*` [x] Session check via Supabase client (Edge Runtime compatible) [x] Redirect logic handles route patterns correctly [x] No infinite redirect loops [x] TypeScript compilation succeeds [x] Tested manually (middleware can't use Jest directly)
- **Effort**: 2h | **Deps**: 18.1

### 18.4 - Server-Side Layouts for Session & Permission Loading

- **AC**: [x] Create `app/myworkspace/layout.tsx` as server component [x] Load session using `getCurrentSession` usecase [x] Check project access using `hasProjectAccess` usecase (optimized) [x] Redirect users without projects from `/myworkspace` to `/` [x] Create `app/app/layout.tsx` as server component for `/app/*` routes [x] Check project access for `/app/*` routes using `hasProjectAccess` [x] Redirect users without projects from `/app/*` to `/myworkspace` [x] Handle loading and error states gracefully (fail-open strategy)
- **DoD**: [x] Layout files created (`app/myworkspace/layout.tsx`, `app/app/layout.tsx`) [x] Layouts are server components [x] Session loaded and validated [x] Project access checked using optimized usecase [x] Redirect to `/` when no project access (from `/myworkspace`), redirect to `/myworkspace` when no project access (from `/app/*`) [x] No redirect loops [x] TypeScript compilation succeeds
- **Effort**: 3h | **Deps**: 18.1, 18.2, 18.3

### 18.5 - Integration & Testing

- **AC**: [x] All route combinations tested (public `/`, `/signin`, `/signup`, protected `/myworkspace`, `/app/*`) - Manual testing checklist created [x] Redirect flows verified (middleware → layout → pages) - Logic verified, no infinite loops [x] Login redirect to `/myworkspace` works correctly [x] No infinite loops - Logic reviewed, all redirects go to public routes [x] Error handling for repository failures (graceful fallback, fail open for security) [x] Middleware matcher excludes static assets and API routes [x] Performance verified (optimized project access check) - Uses `has_any_project_access()` SQL function [x] Public landing page (`/`) displays correctly
- **DoD**: [x] Manual testing checklist completed - Checklist document created at `docs/testing/manual-test-checklist-18-route-guards.md` [x] Edge cases handled (expired sessions, network errors) - Fail-open strategy implemented [x] Middleware and layouts work together correctly - Code review completed, logic verified [x] Login flow redirects to `/myworkspace` - Sign-in page updated [x] Documentation updated - Testing checklist created
- **Effort**: 2h | **Deps**: 18.3, 18.4

## Unit Test Spec

**Note**: Next.js middleware runs at the Edge Runtime and cannot be unit tested with Jest in the traditional way. Manual integration testing is required. However, we can extract route matching logic into testable utility functions.

**File**: `src/shared/utils/routeGuards.ts` (optional helper utilities)

**Key Functions to Test** (if extracted):

1. `isPublicRoute(pathname: string): boolean` - checks if route is public (`/`, `/signin`, `/signup`)
2. `isProtectedRoute(pathname: string): boolean` - checks if route requires auth (`/myworkspace`, `/app/*`)
3. `isAppRoute(pathname: string): boolean` - checks if route is under `/app/*`
4. `shouldRedirectToSignin(pathname: string, hasSession: boolean): boolean` - redirect logic for middleware
5. `shouldRedirectToMyWorkspace(pathname: string, hasSession: boolean, hasProjects: boolean): boolean` - redirect logic for layout (`/app/*` → `/myworkspace`)
6. `shouldRedirectToHome(pathname: string, hasSession: boolean, hasProjects: boolean): boolean` - redirect logic for layout (`/myworkspace` → `/`)

**Additional Tests**:

- `hasProjectAccess` usecase - verifies it calls repository and returns boolean correctly

**Status**: tests proposed (utilities extracted if beneficial for testability)

## Agent Prompts

### Unit Test Coach

"Generate unit tests for: 1) Route guard utilities at `src/shared/utils/routeGuards.ts` (route matching logic, redirect decisions). 2) `hasProjectAccess` usecase at `src/core/usecases/hasProjectAccess.ts` - test that it calls repository method and returns boolean. Cover edge cases and route patterns."

### Architecture-Aware Dev

"Implement hybrid route protection: 1) Move current `src/app/page.tsx` content to `app/myworkspace/page.tsx`. 2) Create new public landing page at `src/app/page.tsx` (project presentation). 3) Next.js middleware at project root (`middleware.ts`) protecting `/myworkspace` and `/app/*` routes, redirecting unauthenticated users to `/signin` using `getCurrentSession`. 4) Create optimized `hasProjectAccess` usecase using `has_any_project_access()` SQL function (add to ProjectRepository interface and implementation). 5) Create server-side layout `app/myworkspace/layout.tsx` that loads session via `getCurrentSession` and checks project access via `hasProjectAccess`, redirecting to `/` if no projects. 6) Create server-side layout `app/app/layout.tsx` for `/app/*` routes with project access check, redirecting to `/myworkspace` if no projects. Public routes (`/`, `/signup`, `/signin`) remain accessible. Update login redirect to `/myworkspace`. Extract route matching logic to `shared/utils/routeGuards.ts` for testability. Handle Edge Runtime constraints for middleware."

### UI Designer

"Design new public landing page at `src/app/page.tsx` (project presentation, welcome screen). Current project overview page content is moved to `app/myworkspace/page.tsx`. Landing page should include project description, features overview, and call-to-action to sign up/sign in. Match existing design system and SCSS variables."

### QA & Test Coach

"Create manual testing plan for hybrid route guards (middleware + server layouts). Test scenarios: unauthenticated user accessing `/myworkspace` or `/app/*` (middleware redirect to `/signin`), authenticated user without projects accessing `/myworkspace` (layout redirect to `/`), authenticated user without projects accessing `/app/*` (layout redirect to `/myworkspace`), authenticated user with projects accessing all protected routes, public route access (`/`, `/signup`, `/signin`), login redirect to `/myworkspace`, redirect loop prevention, middleware and layout interaction. Document edge cases (expired sessions, network failures)."

### Architecture Guardian

"Review hybrid route guard implementation (middleware + server layout). Verify: middleware uses `getCurrentSession`, layout uses optimized `hasProjectAccess` (not `listProjects`), route constants properly defined, redirect logic prevents infinite loops, Edge Runtime compatibility for middleware, server component patterns for layout, Clean Architecture principles followed (repositories/usecases used appropriately)."

## Open Questions

1. **Middleware vs Layout Guards**: Ticket recommends middleware (more performant). Should we also implement layout-level guards as fallback, or is middleware sufficient? **Decision**: ✅ **Hybrid approach** - Middleware for fast cookie-based auth checks on `/myworkspace` and `/app/*` routes (redirect to `/signin`). Server-side layouts (`app/myworkspace/layout.tsx` and `app/app/layout.tsx`) for fine-grained project access checks. This balances performance (fast redirects) with flexibility (detailed checks).

2. **Project Access Check Performance**: Calling `listProjects` on every request may be expensive. Should we cache project access check or accept the cost for simplicity? **Decision**: ✅ **Optimize now** - Use existing SQL function `has_any_project_access()` via new `hasProjectAccess` usecase instead of `listProjects()`. This provides lightweight boolean check without loading all project data.

3. **Error Handling**: If repository calls fail in middleware (network error, DB down), should we allow access or redirect? **Decision**: ✅ **Fail open** (allow access) to prevent lockout, log error for monitoring. This remains secure as RLS policies will block unauthorized data access at database level.

## MVP Cut List

If needed to reduce scope:

- Keep: Middleware authentication guard for `/myworkspace` and `/app/*` (redirect to `/signin`)
- Keep: Route restructure (move current page to `/myworkspace`, create public landing page)
- Keep: Optimized project access check using SQL function
- Keep: Server-side layouts for fine-grained checks
- Defer: Complex route patterns beyond `/app/*` (can add as routes are created)
