/**
 * Current authenticated identity state.
 * This contains session claims only, not profile data.
 */
export type CurrentSession = {
  userId: string;
  loginEmail: string;
  /**
   * Lightweight UI identity hints.
   * These can come from auth metadata and/or a small browser cookie.
   */
  displayName?: string;
  avatarUrl?: string;
  /**
   * Optional preferences captured in auth metadata for fast bootstrap.
   */
  language?: string;
  theme?: "light" | "dark" | "system";
};
