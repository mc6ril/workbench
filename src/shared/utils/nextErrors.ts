/**
 * Detects Next.js dynamic server usage errors that must be re-thrown.
 * These errors are framework control flow signals, not application failures.
 */
export const isDynamicServerUsageError = (error: unknown): boolean => {
  return (
    error instanceof Error && error.message.includes("Dynamic server usage")
  );
};
