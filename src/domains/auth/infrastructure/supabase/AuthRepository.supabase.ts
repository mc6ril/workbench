import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { AUTH_ERROR_CODE } from "@/shared/constants/errorCodes";
import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { handleAuthError } from "@/shared/infrastructure/errors/errorHandlers";

import type {
  AuthenticationError,
  AuthResult,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidTokenError,
  PasswordUpdateNotAllowedError,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/domains/auth/core/domain/auth.schema";
import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";
import { mapSupabaseSessionToCurrentSession } from "@/domains/session/infrastructure/supabase/SessionMapper.supabase";
import { canUpdatePasswordFromAppMetadata } from "@/domains/session/infrastructure/supabase/sessionProviderCapabilities";

/**
 * Create an AuthRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @param adminClient - Optional Supabase admin client (service_role) for privileged operations like user deletion.
 *                      Must be provided for server-side contexts that need admin operations.
 * @returns AuthRepository implementation
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

const createPasswordUpdateNotAllowedError =
  (): PasswordUpdateNotAllowedError => ({
    code: AUTH_ERROR_CODE.PASSWORD_UPDATE_NOT_ALLOWED,
    debugMessage:
      "Password updates are not available for OAuth-only accounts",
  });

const createPasswordUpdateAuthRequiredError = (): AuthenticationError => ({
  code: "AUTHENTICATION_ERROR",
  debugMessage: "User must be authenticated to update password",
});

export const createAuthRepository = (
  client: SupabaseClient,
  adminClient?: SupabaseClient
): AuthRepository => ({
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      const metadata: Record<string, unknown> = {};
      if (input.displayName) {
        metadata.display_name = input.displayName;
      }
      if (input.termsAcceptedAt) {
        metadata.terms_accepted_at = input.termsAcceptedAt;
      }

      const baseOrigin =
        typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = baseOrigin
        ? `${baseOrigin}${AUTH_PAGE_ROUTES.VERIFY_EMAIL}`
        : undefined;
      const signUpOptions: {
        data?: Record<string, unknown>;
        emailRedirectTo?: string;
      } = {};

      if (Object.keys(metadata).length > 0) {
        signUpOptions.data = metadata;
      }

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
          const emailAlreadyExistsError: EmailAlreadyExistsError = {
            code: "EMAIL_ALREADY_EXISTS",
            debugMessage: "User with this email already exists",
          };
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
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage: "User data or session not returned from signup",
        };
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
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage: "No session or user returned from signin",
        };
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
      const baseOrigin =
        typeof window !== "undefined" ? window.location.origin : "";
      const safeNext =
        redirectPath &&
        redirectPath.startsWith("/") &&
        !redirectPath.startsWith("//")
          ? redirectPath
          : PAGE_ROUTES.WORKSPACE;
      const redirectTo = `${baseOrigin}${AUTH_PAGE_ROUTES.CALLBACK}?next=${encodeURIComponent(safeNext)}`;

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
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage: "No OAuth URL returned from Supabase Google signin",
        };
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
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}${AUTH_PAGE_ROUTES.CALLBACK}?next=${AUTH_PAGE_ROUTES.UPDATE_PASSWORD}`
          : undefined;

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
      const ensurePasswordUpdateAllowed = (user: User | null | undefined) => {
        if (!user) {
          handleAuthError(createPasswordUpdateAuthRequiredError());
        }

        if (!canUpdatePasswordFromAppMetadata(user!.app_metadata)) {
          handleAuthError(createPasswordUpdateNotAllowedError());
        }
      };

      // PKCE flow: session was established by the auth callback route.
      // Legacy token flow: verify OTP first then update.
      const hasToken = input.token && input.token.trim() !== "";
      const hasEmail = input.email && input.email.trim() !== "";

      if (hasToken && hasEmail) {
        // Legacy flow: verify OTP with email + token, then update password
        const { data: verifyData, error: verifyError } =
          await client.auth.verifyOtp({
            email: input.email!,
            token: input.token!,
            type: "recovery",
          });

        if (verifyError) {
          handleAuthError(verifyError);
        }

        if (!verifyData.session || !verifyData.user) {
          const error: InvalidTokenError = {
            code: "INVALID_TOKEN",
            debugMessage: "No session or user returned from token verification",
          };
          handleAuthError(error);
        }

        ensurePasswordUpdateAllowed(verifyData.user);

        const { error: updateError } = await client.auth.updateUser({
          password: input.password,
        });

        if (updateError) {
          handleAuthError(updateError);
        }

        const userEmail = verifyData.user!.email || input.email!;
        const baseSession = mapSupabaseSessionToCurrentSession(
          verifyData.session!,
          userEmail
        );
        return { session: baseSession, requiresEmailVerification: false };
      }

      // PKCE flow: session already exists from auth callback code exchange
      const { data: sessionData, error: sessionError } =
        await client.auth.getSession();

      if (sessionError) {
        return handleAuthError(sessionError);
      }

      if (!sessionData.session) {
        const error: InvalidTokenError = {
          code: "INVALID_TOKEN",
          debugMessage:
            "No active session. The reset link may be invalid or expired. Please request a new password reset email.",
        };
        return handleAuthError(error);
      }

      ensurePasswordUpdateAllowed(sessionData.session.user);

      const { error: updateError } = await client.auth.updateUser({
        password: input.password,
      });

      if (updateError) {
        return handleAuthError(updateError);
      }

      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError) {
        return handleAuthError(userError);
      }

      if (!user) {
        const error: InvalidTokenError = {
          code: "INVALID_TOKEN",
          debugMessage: "User not found after password update",
        };
        return handleAuthError(error);
      }

      const baseSession = mapSupabaseSessionToCurrentSession(
        sessionData.session,
        user.email || ""
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
          const error: EmailVerificationError = {
            code: "EMAIL_VERIFICATION_ERROR",
            debugMessage: "No session returned after PKCE email verification",
          };
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
          const error: EmailVerificationError = {
            code: "EMAIL_VERIFICATION_ERROR",
            debugMessage:
              "No session or user returned from email verification token hash",
          };
          handleAuthError(error);
        }

        return mapVerifiedSessionToAuthResult(
          data.session!,
          data.user!.email || input.email || ""
        );
      }

      if (!hasLegacyToken) {
        const error: EmailVerificationError = {
          code: "EMAIL_VERIFICATION_ERROR",
          debugMessage:
            "Missing verification token, token hash, or code for email verification",
        };
        return handleAuthError(error);
      }

      if (!input.email || input.email.trim() === "") {
        const error: EmailVerificationError = {
          code: "EMAIL_VERIFICATION_ERROR",
          debugMessage: "Email is required for legacy email verification",
        };
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
        const error: EmailVerificationError = {
          code: "EMAIL_VERIFICATION_ERROR",
          debugMessage: "No session or user returned from email verification",
        };
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
      // Check if resend is available (Supabase may support this via resend method)
      // For now, we'll use signUp with the same email to trigger resend
      // Note: This is a workaround - Supabase doesn't have a direct resend API
      // In production, this might need to use admin API or a different approach
      const { error } = await client.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },

  async updateUser(input: {
    email?: string;
    password?: string;
  }): Promise<void> {
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

        if (!user) {
          handleAuthError(createPasswordUpdateAuthRequiredError());
        }

        if (!canUpdatePasswordFromAppMetadata(user!.app_metadata)) {
          handleAuthError(createPasswordUpdateNotAllowedError());
        }

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

  async deleteUser(): Promise<void> {
    try {
      // Admin client is required for user deletion (service_role key)
      if (!adminClient) {
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage:
            "Admin client required for user deletion. This operation must be performed server-side.",
        };
        return handleAuthError(error);
      }

      // Get the current user to retrieve their ID
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage: "User must be authenticated to delete account",
        };
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
