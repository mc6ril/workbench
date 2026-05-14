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
  RECIPE_EDITOR_CREATE_DRAFT_PREFIX: "workbench:recipes:create-draft:v1",
});

/**
 * Application limits and constraints.
 * Use these constants for validation, pagination, and UI constraints.
 *
 * Pagination defaults can be adjusted if product requirements change.
 */
export const APP_LIMITS = Object.freeze({
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  AVATAR: {
    MAX_INPUT_SIZE_BYTES: 20 * 1024 * 1024, // 20MB safety cap before client-side processing
    MAX_DIMENSION_PX: 1024,
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
    OUTPUT_MIME_TYPE: "image/webp" as const,
    OUTPUT_QUALITY: 0.86,
    STORAGE_BUCKET: "avatars",
  },
  RECIPE_COVER: {
    MAX_INPUT_SIZE_BYTES: 20 * 1024 * 1024,
    MAX_DIMENSION_PX: 1600,
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
    OUTPUT_MIME_TYPE: "image/webp" as const,
    OUTPUT_QUALITY: 0.84,
    STORAGE_BUCKET: "recipe-covers",
  },
  TICKET_ATTACHMENT: {
    /** Hard limit enforced by the Storage bucket (10 MB). */
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
    /** Images are converted to WebP before upload. */
    IMAGE_MIME_TYPES: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ] as const,
    ALLOWED_MIME_TYPES: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
    ] as const,
    MAX_PER_TICKET: 10,
    IMAGE_MAX_DIMENSION_PX: 2000,
    IMAGE_OUTPUT_MIME_TYPE: "image/webp" as const,
    IMAGE_OUTPUT_QUALITY: 0.85,
    STORAGE_BUCKET: "ticket-attachments",
    SIGNED_URL_TTL_SECONDS: 3600,
  },
});
