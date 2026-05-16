import { isString } from "@/shared/utils/guards";

export const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (
    "digest" in error &&
    isString(error.digest) &&
    error.digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")
  ) {
    return true;
  }

  // Fallback: digest can be stripped when notFound() propagates through
  // Promise.all().catch() chains or react.cache boundaries, while message
  // remains intact.
  return (
    error instanceof Error && error.message === "NEXT_HTTP_ERROR_FALLBACK;404"
  );
};

/**
 * Detects Next.js dynamic server usage errors that must be re-thrown.
 * These errors are framework control flow signals, not application failures.
 */
export const isDynamicServerUsageError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (
    "digest" in error &&
    isString(error.digest) &&
    error.digest === "DYNAMIC_SERVER_USAGE"
  ) {
    return true;
  }

  // Backward-compatible fallback in case older runtime variants omit digest.
  return (
    error instanceof Error && error.message.includes("Dynamic server usage")
  );
};
