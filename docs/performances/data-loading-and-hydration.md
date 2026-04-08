---
title: Data loading and hydration ownership
scope: project shell and workspace/project routes
status: draft
last_updated: 2026-04-08
---

## 1) Current state

The codebase currently uses **multiple, distributed data loading layers**:

- **Route-level server hydration (React Query)**: several `src/app/(protected)/**` server components create a QueryClient, prefetch queries, and send a dehydrated state to the client.
- **Client-side data hooks (React Query)**: most screens rely on owner hooks under `src/domains/*/presentation/hooks/**` and `src/modules/*/presentation/hooks/**`.
- **Shell-level side effects**: `ProjectShell` mounts cross-view UI composition, while module-specific “shell adapters” mount long-lived side effects (e.g., realtime subscriptions) and also trigger view-specific queries.
- **Opportunistic prefetch**: the sidebar triggers both Next.js route prefetch and React Query prefetch on hover/focus.

Observed consequence: the intended “load once, then navigate fast” mental model is diluted because:

- **Prefetch/hydration responsibilities are spread across route files, shell adapters, and UI components**.
- **The same data can be loaded from multiple places** (server hydration + client hook + hover prefetch), making it harder to reason about what is “the” source of truth for loading.
- **Some components that should be pure consumers also initiate prefetch/fetch**, creating incoherent ownership.

## 2) Files that are acting as “loaders” (today)

This is the current set of files that clearly perform server-side hydration or cross-route loading responsibilities.

### Authenticated root loader (session + profile hydration)

- `src/app/(protected)/layout.tsx`
  - **Role**: route group gate + hydration bootstrap
  - **Loads/Hydrates**:
    - session (`getCurrentSession`) via `queryClient.setQueryData(...)`
    - profile (`getProfile`) via `queryClient.prefetchQuery(...)`
  - **Hydration handoff**: `RequestLocaleAppProviders dehydratedState={dehydrate(queryClient)}`

### Workspace loader (workspace dashboard queries)

- `src/app/(protected)/workspace/page.tsx`
  - **Role**: server-side prefetch for workspace dashboard
  - **Loads/Hydrates**:
    - projects with stats (`listProjectsWithStats`)
    - reclaimable projects (`listReclaimableProjects`)
    - billing visibility (`getBillingVisibility`)
  - **Hydration handoff**: `HydrationBoundary state={dehydrate(queryClient)}`

### Project container loader (project access + base project context)

- `src/app/(protected)/[projectId]/layout.tsx`
  - **Role**: project access check + project baseline hydration for all project routes
  - **Loads/Hydrates**:
    - access check: `getProjectForRoute(projectId)` (server-only, request-deduped)
    - current role (`getCurrentProjectRole`)
    - project members (`listProjectMembers`)
    - board project short code (`getProjectShortCode`) (module-owned but hydrated here)
  - **Hydration handoff**: `HydrationBoundary state={dehydrate(queryClient)}`
  - **Shell composition**: mounts `ProjectShell` and a module `shellAdapter` (currently `BoardShellAdapter`)

### Board view loader (board page hydration)

- `src/app/(protected)/[projectId]/board/page.tsx`
  - **Role**: server-side prefetch for the board view
  - **Loads/Hydrates**:
    - board configuration (`getBoardConfiguration`)
    - tickets list (`listTickets`)
    - ticket assignees by project (`getTicketAssigneesByProjectId`)
  - **Hydration handoff**: `HydrationBoundary state={dehydrate(queryClient)}`

### Hydration plumbing (provider side)

- `src/shared/providers/queryClient.ts`
  - **Role**: central React Query client config for SSR prefetch + client runtime
- `src/shared/providers/ReactQueryProvider.tsx`
  - **Role**: client QueryClientProvider + HydrationBoundary
- `src/shared/providers/RequestLocaleAppProviders.tsx`
  - **Role**: request locale resolution + provider composition
- `src/shared/providers/AppProvider.tsx`
  - **Role**: global providers + runtime sync gate (see “should consume but also fetch” below)

## 3) Files that should primarily consume data, but currently fetch/prefetch too

These are the concrete places where loading behavior leaks into UI/components (or where “loader ownership” is ambiguous).

### UI-driven prefetch in the sidebar

- `src/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.tsx`
  - **Does**:
    - Next.js route prefetch (`router.prefetch(...)`) when hovering/focusing sidebar items
    - triggers workspace React Query prefetch via `usePrefetchWorkspaceProjects`
  - **Why it’s problematic**:
    - sidebar becomes a data-loader by interaction side effect
    - prefetch timing is user-input-driven and can compete with more important in-flight queries
    - spreads “project/workspace warmup” logic outside the shell/route layer

- `src/domains/workspace/presentation/hooks/usePrefetchWorkspaceProjects.ts`
  - **Does**: `queryClient.prefetchQuery(...)` for workspace projects queries
  - **Why it’s problematic**:
    - this is a “loader hook” mounted from a navigation component
    - the gateway used is a **browser singleton** (`workspaceProjectCatalogGateway`), which can hide implicit auth/session coupling and makes ownership less explicit

### Global runtime gate triggering profile load

- `src/shared/providers/AppProvider.tsx`
- `src/domains/profile/presentation/providers/useProfileRuntimeSync.ts`
  - **Does**: blocks app rendering behind `useMyProfile()` when authenticated
  - **Why it’s problematic**:
    - turns “global providers” into an implicit loader
    - increases perceived latency if profile hydration is missing, stale, or refetched
    - creates a second “bootstrap” pathway in addition to `src/app/(protected)/layout.tsx`

### Page-level Stripe calls from presentation pages

- `src/domains/settings/presentation/pages/account/index.tsx`
- `src/domains/billing/presentation/pages/pricing/index.tsx`
  - **Does**: `fetch("/api/stripe/...")` directly from page-level UI
  - **Why it’s problematic**:
    - couples UI pages to imperative network calls
    - bypasses the domain/module “hook -> usecase -> port” ownership pattern

### Potential duplication: module hooks fetching what was already hydrated

- `src/modules/board/presentation/projectShell/boardShellAdapter.tsx`
  - **Consumes**:
    - `useBoardConfiguration(projectId, { enabled: isBoardShellView })`
    - `useProjectMembers(projectId)`
  - **Notes**:
    - these should be pure consumers of hydrated data, but they will still “own” the query execution on the client if hydration is missing or keys mismatch.
    - realtime subscription (`useProjectRealtime`) is intentionally long-lived; its invalidations can cause refetch bursts if keys and staleTime are not aligned with the hydration strategy.

## 4) Expected structure after refactor (clear ownership)

Goal: re-establish a single, coherent story:

- **One loader layer per navigation scope** (app-level auth, workspace, project container, per-view module page).
- **UI components consume only** (render, navigate, emit events), with no ad-hoc data warmup.
- **Optional prefetch lives in shell/route adapters**, not in UI primitives.

### A) Loader boundaries (what should load where)

- **Authenticated app bootstrap**
  - owner: `src/app/(protected)/layout.tsx`
  - responsibilities:
    - session bootstrap
    - minimal profile bootstrap required for global UX (theme/locale)
    - provide dehydrated state to client providers

- **Workspace route bootstrap**
  - owner: `src/app/(protected)/workspace/page.tsx`
  - responsibilities:
    - prefetch workspace dashboard queries needed for first paint
    - do not embed “project warmup” here

- **Project container bootstrap (ShellProject responsibility)**
  - owner: `src/app/(protected)/[projectId]/layout.tsx` + `src/domains/project/presentation/layouts/projectShell/ProjectShell.tsx`
  - responsibilities:
    - access check + baseline project context hydration (role, members, enabled modules)
    - expose a single extension point for modules to declare:
      - “base queries for this project”
      - “view queries for current tab”
      - “optional prefetch policy on navigation intent”

- **Module view bootstrap**
  - owner: each module route page (example: `src/app/(protected)/[projectId]/board/page.tsx`)
  - responsibilities:
    - hydrate view-critical queries only (board config, ticket list, assignees)
    - keep additional/secondary queries client-only and behind `enabled`

### B) What should become pure consumers

- `src/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.tsx`
  - should: navigate + mark perf events
  - should not: trigger React Query prefetch for workspace/project data

- `src/domains/workspace/presentation/hooks/usePrefetchWorkspaceProjects.ts`
  - should either:
    - move under a shell-level “prefetch policy” owned by workspace/project shell, or
    - be removed if SSR hydration covers the needs reliably

- `src/shared/providers/AppProvider.tsx` + `useProfileRuntimeSync.ts`
  - should: apply already-hydrated preferences
  - should not: block the entire app behind a profile query unless strictly required
    - if strict is required, then it must be owned and guaranteed by `src/app/(protected)/layout.tsx` (single bootstrap path)

- Stripe flows
  - should: be triggered via a domain hook/usecase (UI consumes the hook)
  - pages should not call `fetch()` directly

### C) Practical refactor target (file-level)

After refactor, the “places that load” should be limited to:

- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/workspace/page.tsx`
- `src/app/(protected)/[projectId]/layout.tsx`
- `src/app/(protected)/[projectId]/*/page.tsx` (one per module view, e.g. board)
- plus module/domain React Query hooks (execution layer), but with:
  - stable queryKeys aligned with SSR prefetch keys
  - clear `enabled` gating to avoid eager refetch on mount when hydrated

