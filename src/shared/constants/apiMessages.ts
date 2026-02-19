/**
 * Centralized API response messages for all server-side route handlers.
 * These are technical/debug messages returned in JSON responses,
 * not user-facing strings (UI uses i18n for translated messages).
 */

export const API_MESSAGES_COMMON = Object.freeze({
  NOT_AUTHENTICATED: "Authentication required",
  UNKNOWN_ERROR: "Unknown error",
} as const);

export const API_MESSAGES_STRIPE = Object.freeze({
  CHECKOUT_FAILED: "Failed to create checkout session",
  PORTAL_FAILED: "Failed to create billing portal session",
  INVALID_PLAN: "Invalid plan. Must be 'pro' or 'team'.",
  MISSING_SIGNATURE: "Missing stripe-signature header",
  WEBHOOK_FAILED: "Webhook processing failed",
} as const);

export const API_MESSAGES_AUTH = Object.freeze({
  USER_DELETED: "User deleted successfully",
  DELETE_FAILED: "Failed to delete user",
} as const);
