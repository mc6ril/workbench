import type { Locale } from "@/shared/i18n/config";
import type { UserPreferences } from "@/shared/user/userPreferences";

export type CurrentAuthIdentity = {
  userId: string;
  loginEmail: string;
  isSuperuser: boolean;
  canUpdatePassword: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  preferences: UserPreferences;
};

export type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
  termsAcceptedAt?: string;
  /** Used in Supabase email templates (`user_metadata.locale`). */
  locale: Locale;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type ResetPasswordInput = {
  email: string;
};

export type UpdatePasswordInput = {
  password: string;
};

export type VerifyEmailLinkType = "email" | "signup";

export type VerifyEmailInput = {
  email?: string;
  token?: string;
  tokenHash?: string;
  code?: string;
  type?: VerifyEmailLinkType;
};

export type UpdateCredentialsInput = {
  email?: string;
  password?: string;
};

export type AuthResult = {
  session: CurrentAuthIdentity | null;
  requiresEmailVerification?: boolean;
};
