---
Generated: 2026-04-08 14:26:13
Report Type: performance
Command: data-loading-hydration-baseline
---

## Goal

Document current data-loading and hydration initiation points to validate the refactor outcomes:

- Each concern has a single primary owner at the route/shell boundary.
- Hydrated queries do not immediately refetch on mount given the default `staleTime`.

## React Query defaults (shared)

- Query defaults: `staleTime = 5 min`, `gcTime = 5 min`, `refetchOnWindowFocus = false`
- Source: `src/shared/providers/queryClient.ts`

## Server-side loader and hydration boundaries

### Protected app bootstrap

- **Owner**: `src/app/(protected)/layout.tsx`
- **Server work**:
  - auth identity bootstrap, then `queryClient.setQueryData(...)`
  - `queryClient.prefetchQuery(profileQueryKeys.userProfiles.detail(identity.userId), getProfile(...))`
- **Hydration handoff**: `RequestLocaleAppProviders dehydratedState={dehydrate(queryClient)}`

Expected:\n+- Session and profile should be in the client cache on first render.\n+- No immediate profile refetch on mount when hydrated (unless keys mismatch or hydration is missing).\n+

### Workspace bootstrap

- **Owner**: `src/app/(protected)/workspace/page.tsx`
- **Server work** (prefetch in `Promise.all`):
  - `workspaceQueryKeys.projects.withStats()` -> `listProjectsWithStats(...)`
  - `workspaceQueryKeys.projects.reclaimable()` -> `listReclaimableProjects(...)`
  - `billingQueryKeys.config.billingVisibility()` -> `getBillingVisibility(...)`
- **Hydration handoff**: `HydrationBoundary state={dehydrate(queryClient)}`

Expected:\n+- Workspace routes should not rely on sidebar-driven React Query prefetch to be fast.\n+

### Project baseline bootstrap

- **Owner**: `src/app/(protected)/[projectId]/layout.tsx`
- **Server work**:
  - `getProjectForRoute(projectId)` access check (server-only)
  - Prefetches:
    - `projectQueryKeys.projects.currentRole(projectId)`
    - `projectQueryKeys.members.byProject(projectId)`
    - `boardQueryKeys.projects.shortCode(projectId)` (candidate to move to board-only)\n+

### Board view bootstrap

- **Owner**: `src/app/(protected)/[projectId]/board/page.tsx`
- **Server work** (prefetch in `Promise.all`):
  - `queryKeys.projects.boardConfiguration(projectId)`
  - `queryKeys.projects.ticketsList(projectId, undefined, undefined)`
  - `queryKeys.tickets.assigneesByProjectId(projectId)`

## Non-route initiation points (client)

### Global runtime gate / preferences sync

- **Owner**: `src/domains/profile/presentation/providers/useProfileRuntimeSync.ts`
- **Current behavior**: returns `false` while `useMyProfile()` is pending/loading for authenticated sessions.\n+- **Risk**: even with SSR hydration, a transient pending state can block the entire authenticated shell.\n+

### Leaf-owned prefetch policy

- **Owner**: `src/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.tsx`
- **Current behavior**:
  - Next.js route prefetch on hover/focus (`router.prefetch(item.href)`)\n+ - Workspace React Query prefetch on profile menu hover (`usePrefetchWorkspaceProjects`)\n+- **Risk**: navigation primitives decide data policy.\n+

### Shell navigation entitlement dependencies

- **Owner**: `src/domains/project/presentation/hooks/useSidebarItems.ts`
- **Current behavior**:
  - reads `useSubscription()` and `useBillingVisibility()` to decide locked items and visibility\n+ - considers entitlements “ready” only after subscription query is fetched\n+- **Risk**: project shell depends on cross-cutting queries that are not explicitly hydrated at the `[projectId]` boundary.\n+

## Manual verification checklist (DevTools Network)

1. **First authenticated load**\n+ - Confirm `profile` is available from hydration.\n+ - Confirm no immediate refetch for hydrated queries.\n+
2. **Workspace → Project navigation**\n+ - Confirm project layout hydration covers role/members (and later entitlements).\n+ - Confirm sidebar does not trigger extra workspace-query prefetch.\n+
3. **Project → Board navigation**\n+ - Confirm board page hydration covers board configuration, ticket list, assignees (and later short code if moved).\n\*\*\* End Patch"}
