---
title: Data loading and hydration ownership
scope: project shell and workspace/project routes
status: draft
last_updated: 2026-04-08
---

## 1) Assessment

This analysis is directionally correct: data loading responsibilities are
currently distributed across route loaders, shell-level client adapters,
global providers, and UI-triggered prefetch. That makes ownership harder to
reason about.

Two nuances matter, though:

- The main issue is **ownership ambiguity**, not guaranteed duplicate network
  traffic.
  - Most SSR-prefetched queries reuse the same query keys as client hooks.
  - `createAppQueryClient()` sets `staleTime: 5 minutes`, so hydrated queries
    often do **not** refetch immediately on mount.
- UI/event-driven prefetch is **not inherently wrong**.
  - Next.js route prefetch on hover/focus is usually a good UX optimization.
  - The problem is that the policy currently lives inside a leaf UI component
    (`SidebarNavigation`) instead of a clear shell/route owner.

Bottom line: the refactor direction is sound, but the current problem should be
framed as "too many places can initiate loading for the same concern" rather
than "the app always loads the same data twice."

## 2) Verified loading paths today

### A) Server loaders with SSR hydration

- `src/app/(protected)/layout.tsx`
  - **Role**: authenticated app bootstrap
  - **Loads/Hydrates**:
    - auth identity via `queryClient.setQueryData(...)`
    - profile (`getProfile`) via `queryClient.prefetchQuery(...)`
  - **Hydration handoff**:
    - `RequestLocaleAppProviders dehydratedState={dehydrate(queryClient)}`

- `src/app/(protected)/workspace/page.tsx`
  - **Role**: workspace route bootstrap
  - **Loads/Hydrates**:
    - projects with stats (`listProjectsWithStats`)
    - reclaimable projects (`listReclaimableProjects`)
    - billing visibility (`getBillingVisibility`)
  - **Hydration handoff**:
    - `HydrationBoundary state={dehydrate(queryClient)}`

- `src/app/(protected)/[projectId]/layout.tsx`
  - **Role**: project access check + baseline project bootstrap
  - **Loads/Hydrates**:
    - access check: `getProjectForRoute(projectId)` (server-only)
    - current role (`getCurrentProjectRole`)
    - project members (`listProjectMembers`)
    - board project short code (`getProjectShortCode`)
  - **Hydration handoff**:
    - `HydrationBoundary state={dehydrate(queryClient)}`
  - **Shell composition**:
    - mounts `ProjectShell` and `BoardShellAdapter`

- `src/app/(protected)/[projectId]/board/page.tsx`
  - **Role**: board view bootstrap
  - **Loads/Hydrates**:
    - board configuration (`getBoardConfiguration`)
    - tickets list (`listTickets`)
    - ticket assignees by project (`getTicketAssigneesByProjectId`)
  - **Hydration handoff**:
    - `HydrationBoundary state={dehydrate(queryClient)}`

### B) Hydration plumbing (not loaders)

- `src/shared/providers/queryClient.ts`
  - shared React Query defaults (`staleTime: 5 min`, `refetchOnWindowFocus: false`)
- `src/shared/providers/ReactQueryProvider.tsx`
  - client `QueryClientProvider` + `HydrationBoundary`
- `src/shared/providers/RequestLocaleAppProviders.tsx`
  - request-locale resolution + provider composition
- `src/shared/providers/AppProvider.tsx`
  - global providers and runtime gate orchestration

### C) Client-side loading and prefetch outside route loaders

- `src/shared/providers/AppProvider.tsx`
- `src/domains/profile/presentation/providers/useProfileRuntimeSync.ts`
  - **Does**:
    - blocks rendering until `useMyProfile()` settles for authenticated sessions
  - **Why it matters**:
    - it reuses the same profile query as SSR hydration, but it still acts as a
      global runtime gate
    - if protected-layout hydration is ever missing, stale, or delayed, the
      whole authenticated shell waits on a client-side query

- `src/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.tsx`
  - **Does**:
    - Next.js route prefetch (`router.prefetch(...)`) on sidebar hover/focus
    - workspace React Query prefetch via `usePrefetchWorkspaceProjects`
  - **Why it matters**:
    - prefetch policy is owned by a navigation primitive instead of the shell or route
    - this is an ownership issue first, not proof that prefetch itself is bad

- `src/domains/workspace/presentation/hooks/usePrefetchWorkspaceProjects.ts`
  - **Does**:
    - `queryClient.prefetchQuery(...)` for workspace queries from a browser singleton gateway
  - **Why it matters**:
    - it is effectively a loader helper, but it is mounted from UI interaction
    - ownership is implicit rather than declared

- `src/domains/project/presentation/hooks/useSidebarItems.ts`
  - **Does**:
    - reads `useSubscription()` and `useBillingVisibility()` to compute locked navigation items
  - **Why it matters**:
    - project-shell navigation depends on client queries that are not owned by
      the project route loader
    - this is not necessarily wrong, but it means project-shell rendering still
      has cross-cutting data dependencies

- `src/modules/board/presentation/projectShell/boardShellAdapter.tsx`
  - **Does**:
    - mounts long-lived realtime side effects
    - reads board configuration and project members to build toolbar/filter UI
  - **Why it matters**:
    - because query keys align with SSR-prefetched keys, this is mostly a
      consumer with fallback fetch capability, not a guaranteed duplicate fetch
    - it still mixes shell UI composition with runtime data ownership

- `src/domains/settings/presentation/pages/account/index.tsx`
- `src/domains/billing/presentation/pages/pricing/index.tsx`
  - **Does**:
    - calls Stripe endpoints directly via `fetch(...)` from presentation pages
  - **Why it matters**:
    - couples page components to imperative network calls
    - bypasses the domain/module `hook -> usecase -> port` ownership pattern

## 3) What is actually problematic

The strongest issues are:

- **Too many initiation points for the same concern**
  - auth/profile bootstrap spans route hydration and a global runtime gate
  - workspace warmup is triggered both by route hydration and sidebar intent
- **Shell composition and data policy are mixed together**
  - `ProjectShell` and `BoardShellAdapter` currently combine UI contribution,
    long-lived subscriptions, and view-aware data reads
- **Cross-cutting shell data is not explicitly owned**
  - project navigation depends on subscription/billing visibility; these should
    be owned by the project route layout, but are currently unowned at that
    boundary
- **Presentation pages perform imperative network flows directly**
  - Stripe entry points live in page components instead of a domain boundary

## 4) Where the original wording was too strong

These points need softer wording:

- "The same data can be loaded from multiple places"
  - Better: **"The same concern can be initiated from multiple places."**
  - Reason: SSR-prefetched queries and client hooks mostly share aligned query
    keys, so duplicate network work is possible but not guaranteed.

- "Components that should be pure consumers also fetch"
  - Better: **"Some components are both consumers and loading-policy owners."**
  - Reason: `BoardShellAdapter` mostly consumes hydrated data, but it also owns
    realtime subscriptions and therefore part of the refresh policy.

- "UI-driven prefetch in the sidebar is problematic"
  - Better: **"UI-driven prefetch is useful, but its ownership is misplaced."**
  - Reason: hover/focus prefetch is a valid perf technique; the issue is who
    decides when and what to prefetch.

## 5) Refactor target

Goal: assign one primary owner per concern and one loader boundary per
navigation scope.

### A) Global authenticated concerns

- **Owner**: `src/app/(protected)/layout.tsx`
- **Should own**:
  - auth identity bootstrap
  - profile bootstrap required for runtime preferences
  - any other concern that can block the authenticated shell
- **Rule**:
  - if a query can block the whole authenticated shell, it should either be
    guaranteed here or stop blocking the whole shell

### B) Workspace concerns

- **Owner**: `src/app/(protected)/workspace/page.tsx`
- **Should own**:
  - workspace first-paint queries
- **Should not own**:
  - project-route warmup
  - cross-route speculative prefetch

### C) Project baseline concerns

- **Owner**: `src/app/(protected)/[projectId]/layout.tsx`
- **Should own**:
  - access check
  - current role
  - project members
  - project-level metadata needed across project views
  - billing visibility and subscription summary / entitlements
    - these are only consumed within project routes (navigation lock state via
      `useSidebarItems`) — loading them at the global layout level would add
      unnecessary weight to every authenticated render
- **Should make explicit**:
  - whether module-owned metadata such as project short code is truly
    project-baseline or only board-view metadata

### D) Module view concerns

- **Owner**: each module route page, e.g. `src/app/(protected)/[projectId]/board/page.tsx`
- **Should own**:
  - view-critical queries needed for first meaningful paint
- **May remain client-only**:
  - secondary panels
  - optional onboarding signals
  - speculative or interaction-driven data

### E) Prefetch policy

- **Owner**: shell/route layer, not leaf UI components
- **Rule**:
  - keep Next.js route prefetch
  - keep React Query prefetch only when there is a named owner, bounded scope,
    and measurable benefit
  - expose prefetch as a shell-level policy, not as hidden behavior inside
    navigation primitives

## 6) Practical next steps

1. Move `usePrefetchWorkspaceProjects` ownership out of `SidebarNavigation` and
   into a shell-owned prefetch policy, or remove it if SSR hydration + route
   prefetch already give acceptable latency.
2. Move `subscription` and `billingVisibility` ownership to
   `src/app/(protected)/[projectId]/layout.tsx`. These queries are only consumed
   within project routes (navigation lock state in `useSidebarItems`) and should
   not be loaded at the global authenticated layout.
3. Turn `useProfileRuntimeSync` into a pure "apply hydrated preferences" step
   unless the protected layout explicitly guarantees the profile query on every
   authenticated render path.
4. Keep `ProjectShellContributionProvider` focused on UI contribution
   (`toolbar`, `filters`, `onMount`) and introduce a separate loader/prefetch
   contract if modules need to declare data requirements.
5. Replace page-level Stripe `fetch()` calls with a dedicated domain
   hook/usecase boundary.
