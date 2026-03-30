import type { CurrentSession } from "@/domains/session/core/domain/currentSession.schema";

export type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
  termsAcceptedAt?: string;
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
  token?: string;
  email?: string;
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
  session: CurrentSession | null;
  requiresEmailVerification?: boolean;
};
