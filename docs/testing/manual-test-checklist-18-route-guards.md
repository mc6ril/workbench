# Manual Testing Checklist - Route Guards (Ticket 18)

This document provides a checklist for manually testing the route guard implementation (middleware + server layouts).

## Prerequisites

- Development server running (`npm run dev`)
- Access to browser dev tools (Network tab, Console)
- Test user accounts (authenticated with/without projects)
- Database with test data

## Test Scenarios

### 1. Public Routes (No Authentication Required)

- [ ] **`/` (Landing Page)**
  - Access `/` while not authenticated
  - Expected: Landing page displays correctly
  - Expected: No redirects

- [ ] **`/signin`**
  - Access `/signin` while not authenticated
  - Expected: Sign-in page displays correctly
  - Expected: No redirects

- [ ] **`/signup`**
  - Access `/signup` while not authenticated
  - Expected: Sign-up page displays correctly
  - Expected: No redirects

### 2. Unauthenticated User Accessing Protected Routes

- [ ] **`/myworkspace` (Unauthenticated)**
  - Access `/myworkspace` while not authenticated
  - Expected: Middleware redirects to `/signin`
  - Expected: URL contains `?redirect=/myworkspace` parameter
  - Expected: After sign-in, redirects back to `/myworkspace`

- [ ] **`/app/*` (Unauthenticated)**
  - Access `/app/test` while not authenticated (if route exists)
  - Expected: Middleware redirects to `/signin`
  - Expected: URL contains `?redirect=/app/test` parameter

### 3. Authenticated User Without Projects

- [ ] **`/myworkspace` (Authenticated, No Projects)**
  - Sign in with user that has no projects
  - Access `/myworkspace`
  - Expected: Layout redirects to `/` (home/landing page)
  - Expected: No infinite redirect loop
  - Expected: User sees landing page

- [ ] **`/app/*` (Authenticated, No Projects)**
  - Sign in with user that has no projects
  - Access `/app/test` (if route exists)
  - Expected: Layout redirects to `/myworkspace`
  - Expected: `/myworkspace` layout then redirects to `/` (since no projects)
  - Expected: No infinite redirect loop
  - Expected: User eventually sees landing page

### 4. Authenticated User With Projects

- [ ] **`/myworkspace` (Authenticated, With Projects)**
  - Sign in with user that has projects
  - Access `/myworkspace`
  - Expected: Workspace page displays correctly
  - Expected: No redirects
  - Expected: Projects list displays

- [ ] **`/app/*` (Authenticated, With Projects)**
  - Sign in with user that has projects
  - Access `/app/test` (if route exists)
  - Expected: App page displays correctly
  - Expected: No redirects

### 5. Login Flow

- [ ] **Login Redirect**
  - Start on `/` (not authenticated)
  - Click "Sign In" or navigate to `/signin`
  - Sign in successfully
  - Expected: Redirects to `/myworkspace` (not `/`)
  - Expected: Workspace page displays

### 6. Redirect Loop Prevention

- [ ] **No Infinite Loops**
  - Test all combinations above
  - Monitor browser network tab for redirect chains
  - Expected: Maximum 2-3 redirects in any scenario
  - Expected: No circular redirects (browser should detect and stop)
  - Expected: Eventually lands on a valid page

### 7. Middleware Matcher

- [ ] **Static Assets Excluded**
  - Access static files (images, CSS, JS)
  - Expected: No middleware execution (check logs)
  - Expected: Files load normally

- [ ] **API Routes Excluded**
  - Access `/api/*` routes (if any)
  - Expected: No middleware execution
  - Expected: API routes work independently

### 8. Error Handling

- [ ] **Database Error (Fail Open)**
  - Simulate database connection error
  - Access protected route
  - Expected: User can access route (fail-open strategy)
  - Expected: Error logged in console
  - Expected: RLS policies still protect data at DB level

- [ ] **Network Error**
  - Simulate network failure during session check
  - Access protected route
  - Expected: Fail-open behavior
  - Expected: Error logged

### 9. Edge Cases

- [ ] **Expired Session**
  - Wait for session to expire (or manually expire)
  - Access protected route
  - Expected: Redirects to `/signin`
  - Expected: After re-authentication, redirects to original route

- [ ] **Direct URL Access**
  - Type protected route directly in browser address bar
  - Expected: Appropriate redirect based on auth state

- [ ] **Browser Back/Forward**
  - Navigate through protected routes
  - Use browser back/forward buttons
  - Expected: Guards still work correctly
  - Expected: No unexpected redirects

## Performance Verification

- [ ] **Optimized Project Access Check**
  - Monitor database queries (if possible)
  - Access `/myworkspace` with projects
  - Expected: Uses `has_any_project_access()` SQL function
  - Expected: Not calling `listProjects()` (no full project data loaded)
  - Expected: Fast response time

## Integration Points

- [ ] **Middleware → Layout Interaction**
  - Middleware checks authentication
  - Layout checks project access
  - Expected: Both work together correctly
  - Expected: No conflicts or double-checks causing issues

- [ ] **Route Constants**
  - Verify route constants are correctly defined
  - Expected: `PUBLIC_ROUTES`, `PROTECTED_ROUTES`, `APP_ROUTES` match implementation
  - Expected: Helper functions (`isPublicRoute`, `isProtectedRoute`) work correctly

## Notes

- All tests should be performed in both development and production builds
- Test in multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices if applicable
- Monitor console for any errors or warnings
- Check network tab for unexpected redirects or failed requests

## Sign-Off

- [ ] All test scenarios completed
- [ ] No critical issues found
- [ ] Edge cases handled appropriately
- [ ] Performance acceptable
- [ ] Documentation updated if needed

**Tester**: _________________  
**Date**: _________________  
**Status**: _________________

