import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { createAppError } from "@/shared/errors/appError";
import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import {
  buildAuthCallbackPath,
  sanitizeInternalRedirectPath,
  VERIFIED_EMAIL_REDIRECT_PATH,
} from "@/shared/utils/authRedirect";

import type {
  AuthenticationError,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidTokenError,
  PasswordUpdateNotAllowedError,
} from "@/domains/auth/core/domain/auth.errors";
import type {
  AuthResult,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdateCredentialsInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/domains/auth/core/domain/auth.types";
import type { AuthGateway } from "@/domains/auth/core/ports/auth.gateway";
import { handleAuthError } from "@/domains/auth/infrastructure/errors/authErrorHandler";
import { mapSupabaseSessionToCurrentSession } from "@/domains/auth/infrastructure/supabase/AuthMapper.supabase";
import { canUpdatePasswordFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";

/**
 * Create an AuthGateway implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @param adminClient - Optional Supabase admin client (service_role) for privileged operations like user deletion.
 *                      Must be provided for server-side contexts that need admin operations.
 * @returns AuthGateway implementation
 */
const redirectToOAuthUrl = (url: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.top && window.top !== window.self) {
      window.top.location.assign(url);
      return;
    }
  } catch {
    // Ignore frame access issues and fall back to the current window.
  }

  window.location.assign(url);
};

const mapVerifiedSessionToAuthResult = (
  session: Session,
  fallbackEmail?: string
): AuthResult => {
  const userEmail = session.user.email || fallbackEmail || "";

  return {
    session: mapSupabaseSessionToCurrentSession(session, userEmail),
    requiresEmailVerification: false,
  };
};

const createPasswordUpdateNotAllowedError = (): PasswordUpdateNotAllowedError =>
  createAppError(AUTH_ERROR_CODE.PASSWORD_UPDATE_NOT_ALLOWED, {
    debugMessage: "Password updates are not available for OAuth-only accounts",
  }) as PasswordUpdateNotAllowedError;

const createPasswordUpdateAuthRequiredError = (): AuthenticationError =>
  createAppError(AUTH_ERROR_CODE.AUTHENTICATION_ERROR, {
    debugMessage: "User must be authenticated to update password",
  }) as AuthenticationError;

const ensurePasswordUpdateAllowed = (user: User | null | undefined): User => {
  if (!user) {
    return handleAuthError(createPasswordUpdateAuthRequiredError());
  }

  if (!canUpdatePasswordFromAppMetadata(user.app_metadata)) {
    return handleAuthError(createPasswordUpdateNotAllowedError());
  }

  return user;
};

const buildBrowserAuthCallbackUrl = ({
  nextPath,
  fallbackPath,
}: {
  nextPath?: string | null;
  fallbackPath?: string;
}): string | undefined => {
  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  if (!baseOrigin) {
    return undefined;
  }

  return `${baseOrigin}${buildAuthCallbackPath({
    nextPath,
    fallbackPath,
  })}`;
};

export const createAuthGateway = (
  client: SupabaseClient,
  adminClient?: SupabaseClient
): AuthGateway => ({
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      // `locale` is available in Supabase email templates as `{{ .Data.locale }}` (user_metadata).
      const metadata: Record<string, unknown> = {
        locale: input.locale,
      };
      if (input.displayName) {
        metadata.display_name = input.displayName;
      }
      if (input.termsAcceptedAt) {
        metadata.terms_accepted_at = input.termsAcceptedAt;
      }

      const emailRedirectTo = buildBrowserAuthCallbackUrl({
        nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
      });
      const signUpOptions: {
        data?: Record<string, unknown>;
        emailRedirectTo?: string;
      } = {};

      signUpOptions.data = metadata;

      if (emailRedirectTo) {
        signUpOptions.emailRedirectTo = emailRedirectTo;
      }

      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options:
          Object.keys(signUpOptions).length > 0 ? signUpOptions : undefined,
      });

      if (error) {
        handleAuthError(error);
      }

      // Check if user already exists
      // Supabase may return a success even when email exists (for security reasons when "Confirm email" is enabled)
      // We detect this by checking:
      // 1. If email_confirmed_at is set (user exists and is confirmed)
      // 2. If identities array is empty (indicates email is already in use per Supabase docs)
      if (data.user) {
        const hasConfirmedEmail = !!data.user.email_confirmed_at;
        const hasEmptyIdentities =
          !data.user.identities || data.user.identities.length === 0;

        // If user has confirmed email OR has empty identities, they already exist
        if (hasConfirmedEmail || hasEmptyIdentities) {
          const emailAlreadyExistsError: EmailAlreadyExistsError =
            createAppError(AUTH_ERROR_CODE.EMAIL_ALREADY_EXISTS, {
              debugMessage: "User with this email already exists",
            }) as EmailAlreadyExistsError;
          handleAuthError(emailAlreadyExistsError);
        }
      }

      // Handle email verification case: Supabase returns null session when email verification is required
      if (!data.session) {
        return {
          session: null,
          requiresEmailVerification: true,
        };
      }

      // Session exists: user is automatically logged in (email verification not required or already verified)
      if (!data.user || !data.session) {
        const error: AuthenticationError = createAppError(
          AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
          {
            debugMessage: "User data or session not returned from signup",
          }
        ) as AuthenticationError;
        handleAuthError(error);
      }

      const baseSession = mapSupabaseSessionToCurrentSession(
        data.session!,
        data.user!.email || input.email
      );
      return { session: baseSession, requiresEmailVerification: false };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        handleAuthError(error);
      }

      if (!data.session || !data.user) {
        const error: AuthenticationError = createAppError(
          AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
          {
            debugMessage: "No session or user returned from signin",
          }
        ) as AuthenticationError;
        handleAuthError(error);
      }

      const baseSession = mapSupabaseSessionToCurrentSession(
        data.session!,
        data.user!.email || input.email
      );
      return { session: baseSession, requiresEmailVerification: false };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async signInWithGoogle(redirectPath?: string): Promise<void> {
    try {
      const safeNext = sanitizeInternalRedirectPath(
        redirectPath,
        PAGE_ROUTES.WORKSPACE
      );
      const redirectTo = buildBrowserAuthCallbackUrl({
        nextPath: safeNext,
        fallbackPath: PAGE_ROUTES.WORKSPACE,
      });

      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        handleAuthError(error);
      }

      const oauthUrl = data?.url ?? "";

      if (!oauthUrl) {
        const error: AuthenticationError = createAppError(
          AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
          {
            debugMessage: "No OAuth URL returned from Supabase Google signin",
          }
        ) as AuthenticationError;
        return handleAuthError(error);
      }

      redirectToOAuthUrl(oauthUrl);
    } catch (error) {
      handleAuthError(error);
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await client.auth.signOut();

      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },

  async resetPasswordForEmail(input: ResetPasswordInput): Promise<void> {
    try {
      const redirectTo = buildBrowserAuthCallbackUrl({
        nextPath: AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
        fallbackPath: AUTH_PAGE_ROUTES.UPDATE_PASSWORD,
      });

      const { error } = await client.auth.resetPasswordForEmail(input.email, {
        redirectTo,
      });

      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },

  async updatePassword(input: UpdatePasswordInput): Promise<AuthResult> {
    try {
      const { data: sessionData, error: sessionError } =
        await client.auth.getSession();

      if (sessionError) {
        return handleAuthError(sessionError);
      }

      if (!sessionData.session) {
        const error: InvalidTokenError = createAppError(
          AUTH_ERROR_CODE.INVALID_TOKEN,
          {
            debugMessage:
              "No active session. The reset link may be invalid or expired. Please request a new password reset email.",
          }
        ) as InvalidTokenError;
        return handleAuthError(error);
      }

      const session = sessionData.session;
      const sessionUser = ensurePasswordUpdateAllowed(session.user);

      const { data: updateData, error: updateError } =
        await client.auth.updateUser({
          password: input.password,
        });

      if (updateError) {
        return handleAuthError(updateError);
      }

      const updatedUser = updateData.user;
      if (!updatedUser) {
        const error: InvalidTokenError = createAppError(
          AUTH_ERROR_CODE.INVALID_TOKEN,
          {
            debugMessage: "User not found after password update",
          }
        ) as InvalidTokenError;
        return handleAuthError(error);
      }

      const baseSession = mapSupabaseSessionToCurrentSession(
        session,
        updatedUser.email || sessionUser.email || ""
      );
      return { session: baseSession, requiresEmailVerification: false };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
    try {
      const verificationType = input.type ?? "email";
      const hasCode = !!input.code && input.code.trim() !== "";
      const hasTokenHash = !!input.tokenHash && input.tokenHash.trim() !== "";
      const hasLegacyToken = !!input.token && input.token.trim() !== "";

      if (hasCode) {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();

        if (error) {
          return handleAuthError(error);
        }

        if (!session) {
          const error: EmailVerificationError = createAppError(
            AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
            {
              debugMessage: "No session returned after PKCE email verification",
            }
          ) as EmailVerificationError;
          return handleAuthError(error);
        }

        return mapVerifiedSessionToAuthResult(session, session.user.email);
      }

      if (hasTokenHash) {
        const { data, error } = await client.auth.verifyOtp({
          token_hash: input.tokenHash!,
          type: verificationType,
        });

        if (error) {
          handleAuthError(error);
        }

        if (!data.session || !data.user) {
          const error: EmailVerificationError = createAppError(
            AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
            {
              debugMessage:
                "No session or user returned from email verification token hash",
            }
          ) as EmailVerificationError;
          handleAuthError(error);
        }

        return mapVerifiedSessionToAuthResult(
          data.session!,
          data.user!.email || input.email || ""
        );
      }

      if (!hasLegacyToken) {
        const error: EmailVerificationError = createAppError(
          AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
          {
            debugMessage:
              "Missing verification token, token hash, or code for email verification",
          }
        ) as EmailVerificationError;
        return handleAuthError(error);
      }

      if (!input.email || input.email.trim() === "") {
        const error: EmailVerificationError = createAppError(
          AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
          {
            debugMessage: "Email is required for legacy email verification",
          }
        ) as EmailVerificationError;
        return handleAuthError(error);
      }

      const { data, error } = await client.auth.verifyOtp({
        email: input.email!,
        token: input.token!,
        type: verificationType,
      });

      if (error) {
        handleAuthError(error);
      }

      if (!data.session || !data.user) {
        const error: EmailVerificationError = createAppError(
          AUTH_ERROR_CODE.EMAIL_VERIFICATION_ERROR,
          {
            debugMessage: "No session or user returned from email verification",
          }
        ) as EmailVerificationError;
        handleAuthError(error);
      }

      return mapVerifiedSessionToAuthResult(
        data.session!,
        data.user!.email || input.email! || ""
      );
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const emailRedirectTo = buildBrowserAuthCallbackUrl({
        nextPath: VERIFIED_EMAIL_REDIRECT_PATH,
      });

      const { error } = await client.auth.resend({
        type: "signup",
        email,
        ...(emailRedirectTo
          ? {
              options: {
                emailRedirectTo,
              },
            }
          : {}),
      });

      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },

  async updateCredentials(input: UpdateCredentialsInput): Promise<void> {
    try {
      const updateData: { email?: string; password?: string } = {};

      if (input.email) {
        updateData.email = input.email;
      }

      if (input.password) {
        const {
          data: { user },
          error: userError,
        } = await client.auth.getUser();

        if (userError) {
          handleAuthError(userError);
        }

        ensurePasswordUpdateAllowed(user);
        updateData.password = input.password;
      }

      const { error } = await client.auth.updateUser(updateData);

      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },

  async deleteAccount(): Promise<void> {
    try {
      // Admin client is required for user deletion (service_role key)
      if (!adminClient) {
        const error: AuthenticationError = createAppError(
          AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
          {
            debugMessage:
              "Admin client required for user deletion. This operation must be performed server-side.",
          }
        ) as AuthenticationError;
        return handleAuthError(error);
      }

      // Get the current user to retrieve their ID
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        const error: AuthenticationError = createAppError(
          AUTH_ERROR_CODE.AUTHENTICATION_ERROR,
          {
            debugMessage: "User must be authenticated to delete account",
          }
        ) as AuthenticationError;
        return handleAuthError(error);
      }

      // Delete user via admin API (cascade deletes associated data)
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) {
        return handleAuthError(deleteError);
      }

      // Sign out the current session after successful deletion
      await client.auth.signOut();
    } catch (error) {
      handleAuthError(error);
    }
  },

  exchangeCodeForSession: async (code: string): Promise<void> => {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      handleAuthError(error);
    }
  },
});
