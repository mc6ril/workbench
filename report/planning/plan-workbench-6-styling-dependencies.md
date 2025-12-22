---
Generated: 2025-01-27 20:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-6
---

# Implementation Plan: Install Styling Dependencies

## Summary

Goal: Setup SCSS/Sass support with SCSS modules and PostCSS configuration to enable component styling using SCSS variables and modules following project conventions.

Constraints: Must work with Next.js 16.0.10 built-in SCSS support. PostCSS config already exists but may need updates. SCSS imports must support `@/styles/` path alias.

## Solution Outline

- Domain: None
- Usecases: None
- Infrastructure: None
- Presentation: SCSS modules, global styles (`src/styles/`)
- Configuration: `next.config.ts` (optional sassOptions), `postcss.config.mjs`, `package.json`

## Sub-Tickets

### 6.1 - Install Sass Package and Verify Next.js Integration

- AC: [x] `sass` package installed as dev dependency (latest stable version - v1.97.1) [x] Next.js 16 built-in SCSS support verified [x] SCSS files can be imported in components
- DoD: [x] Tests N/A (no business logic) [x] A11y N/A [x] SCSS vars N/A [x] `package.json` updated with sass dependency [x] No dependency conflicts [x] Basic SCSS import works in test component (verified with build)
- Effort: 0.5h | Deps: none

### 6.2 - Configure SCSS Modules and Path Aliases

- AC: [x] SCSS modules (`.module.scss`) working correctly [x] Path alias `@/styles/` works for SCSS imports [x] `sassOptions` configured in `next.config.ts` with includePaths [x] SCSS variables can be imported from `styles/variables/*`
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A [x] SCSS modules compile correctly [x] Path aliases resolve in SCSS imports [x] Test component with SCSS module created and verified
- Effort: 1h | Deps: 6.1

### 6.3 - Verify PostCSS and Production Build

- AC: [ ] PostCSS processes SCSS correctly [ ] SCSS compilation works in dev mode [ ] SCSS compilation works in production build [ ] No warnings or errors in build output
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A [ ] `yarn dev` runs without SCSS errors [ ] `yarn build` completes successfully [ ] Production styles load correctly
- Effort: 0.5h | Deps: 6.1, 6.2

## Unit Test Spec

- File path: N/A (no business logic to test)
- Status: tests N/A (dependency installation and configuration task only)

## Agent Prompts

### Architecture-Aware Dev

```
Install sass package and configure SCSS support for Next.js 16. Verify Next.js built-in SCSS support works. Configure SCSS modules and ensure path aliases (@/styles/) work for SCSS imports. Update next.config.ts with sassOptions if needed for path resolution. Verify PostCSS processes SCSS correctly. Test SCSS compilation in both dev and production builds.
```

### UI Designer

N/A - No UI changes required (configuration task only).

### QA & Test Coach

```
Verify SCSS files compile without errors, SCSS modules work correctly, and styles load properly in both dev and production builds. Test that path aliases work for SCSS imports. No functional testing required - this is a styling configuration verification task.
```

### Unit Test Coach

N/A - No business logic to test.

## Open Questions

1. Do we need to configure `sassOptions` in `next.config.ts` for `@/styles/` path alias, or does Next.js handle it automatically?
2. Should we configure PostCSS plugins (autoprefixer, etc.) or keep default Next.js PostCSS config?

## Notes

- Next.js 16 has built-in SCSS support - only requires `sass` package installation
- PostCSS config already exists (`postcss.config.mjs`) - may need to verify/update
- SCSS modules are supported by default with `.module.scss` extension
- Path aliases configured in `next.config.ts` may need `sassOptions.includePaths` for SCSS imports
- Latest `sass` version: 1.97.1 (as of January 2025)
- SCSS files should be placed in `src/styles/` following Clean Architecture
