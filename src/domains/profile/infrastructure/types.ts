/**
 * Row type for the user_profiles table.
 * Single source of truth for applicative user data.
 */
export type UserProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
};
