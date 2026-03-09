# Smooth Navigation - Protocol and Perf Snapshot

Date: 2026-03-08
Scope: board/backlog/epics/workspace navigation, realtime invalidation strategy

## Instrumentation

- Flag: `NEXT_PUBLIC_ENABLE_NAV_PERF=1`
- Global collector (client): `window.__WORKBENCH_NAV_PERF__`
- API:
  - reset: `window.__WORKBENCH_NAV_PERF__.reset()`
  - snapshot: `window.__WORKBENCH_NAV_PERF__.snapshot()`

The collector reports:

- Supabase request counts (`rest`, `rpc`, `auth`)
- Navigation timings (`p50`, `p95`, samples)
- Full-page loader render count

## Reproducible Procedure (Local Production Build)

1. Export the flag:
   - `NEXT_PUBLIC_ENABLE_NAV_PERF=1`
2. Run:
   - `yarn build`
   - `yarn start`
3. Open the app and execute in browser console:
   - `window.__WORKBENCH_NAV_PERF__.reset()`
4. Execute each scenario 10 times:
   - `board -> backlog -> board`
   - `board -> epics -> backlog`
   - `project -> workspace -> project`
5. Retrieve snapshot:
   - `window.__WORKBENCH_NAV_PERF__.snapshot()`
6. Report values in the table below.

## Before / After Table

| Scenario                        | Req total (before) | Req total (after) | p50 nav ms (before) | p50 nav ms (after) | p95 nav ms (before) | p95 nav ms (after) | Full-page loader (before) | Full-page loader (after) |
| ------------------------------- | ------------------ | ----------------- | ------------------- | ------------------ | ------------------- | ------------------ | ------------------------- | ------------------------ |
| board -> backlog -> board       | 29                 | TBD               | 8.3                 | TBD                | 10.2                | TBD                | 25                        | TBD                      |
| board -> epics -> backlog       | 29                 | TBD               | 8.3                 | TBD                | 10.2                | TBD                | 25                        | TBD                      |
| project -> workspace -> project | 29                 | TBD               | 8.3                 | TBD                | 10.2                | TBD                | 25                        | TBD                      |

## Current Snapshot (Mixed Flow)

- enabled: `true`
- navigation sample count: `22`
- Supabase requests (total): `29`
- full-page loader count: `25`
- navigation p50: `8.3 ms`
- navigation p95: `10.2 ms`
- requests by kind: present in snapshot (not expanded in captured excerpt)

## Notes

- Data is measured in local production mode to reduce development-mode bias.
- Fallback HTTP requests remain allowed (functional consistency first).
- The current baseline values in `before` come from one mixed-flow snapshot and are duplicated across scenarios by request.
