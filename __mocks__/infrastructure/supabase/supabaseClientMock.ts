import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

export type AppSupabaseClientMockOverrides = Partial<AppSupabaseClient>;

/**
 * Returns a lightweight Supabase client mock for tests.
 *
 * Tests can pass only the subset of properties they need, typically using jest.fn().
 */
export const createSupabaseClientMock = (
  overrides: AppSupabaseClientMockOverrides = {}
): AppSupabaseClient => {
  return overrides as AppSupabaseClient;
};
