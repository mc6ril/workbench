import type { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientMockOverrides = Partial<SupabaseClient>;

/**
 * Returns a lightweight Supabase client mock for tests.
 *
 * Tests can pass only the subset of properties they need, typically using jest.fn().
 */
export const createSupabaseClientMock = (
  overrides: SupabaseClientMockOverrides = {},
): SupabaseClient => {
  return overrides as SupabaseClient;
};
