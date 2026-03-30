/**
 * Reads PostgREST / Supabase client `error.code` (e.g. PGRST116) from a thrown value.
 */
export const getPostgrestErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const record = error as Record<string, unknown>;
  return typeof record.code === "string" ? record.code : undefined;
};
