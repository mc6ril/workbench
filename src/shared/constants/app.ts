/**
 * Application-wide constants.
 *
 * This file contains only constant values (no type definitions).
 * Types derived from these constants must be defined in `app.types.ts`.
 *
 * Note: Route constants are defined in `routes.ts` to keep routing logic
 * centralized. This file focuses on storage keys and application limits.
 */

/**
 * Storage key constants for localStorage and sessionStorage.
 * Use these constants to avoid key conflicts and ensure consistency.
 *
 * Keys are namespaced with the "workbench:" prefix.
 * They are defined here for future use once client-side storage is introduced.
 */
export const STORAGE_KEYS = Object.freeze({
  // Example keys (to be used when storage is implemented)
  // USER_PREFERENCES: "workbench:user:preferences",
  // DRAFT_DATA: "workbench:draft:data",
  // THEME: "workbench:theme",
});

/**
 * Application limits and constraints.
 * Use these constants for validation, pagination, and UI constraints.
 *
 * Password limits match Supabase default requirements (minimum 6 characters).
 * All Zod schemas in `core/domain/auth.schema.ts` use these constants.
 * Pagination defaults can be adjusted if product requirements change.
 */
export const APP_LIMITS = Object.freeze({
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  // Additional limits can be added here as needed, for example:
  // MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  // MAX_ITEMS_PER_PAGE: 50,
});
