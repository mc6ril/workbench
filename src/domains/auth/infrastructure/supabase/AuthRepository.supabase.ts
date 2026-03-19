import type { SupabaseClient } from "@supabase/supabase-js";

import { handleAuthError } from "@/shared/infrastructure/errors/errorHandlers";
import type { UserProfileRow } from "@/shared/infrastructure/types";
import { mapUserProfileRowToDomain } from "@/domains/auth/infrastructure/supabase/userProfile/UserProfileMapper.supabase";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";

import type {
  AuthenticationError,
  AuthResult,
  AuthSession,
  EmailAlreadyExistsError,
  EmailVerificationError,
  InvalidTokenError,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/domains/auth/core/domain/schema/auth.schema";
import { DEFAULT_USER_PREFERENCES } from "@/domains/auth/core/domain/schema/auth.schema";
import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";
import { mapSupabaseSessionToDomain } from "@/domains/auth/infrastructure/supabase/AuthMapper.supabase";

/**
 * Create an AuthRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @param adminClient - Optional Supabase admin client (service_role) for privileged operations like user deletion.
 *                      Must be provided for server-side contexts that need admin operations.
 * @returns AuthRepository implementation
 */
/**
 * Fetches profile data from user_profiles and enriches an AuthSession.
 * Falls back to defaults if the profile is not yet available (e.g. during signup race).
 */
const enrichSessionWithProfile = async (
  client: SupabaseClient,
  session: AuthSession
): Promise<AuthSession> => {
  const { data } = await client
    .from("user_profiles")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  if (!data) {
    return session;
  }

  const profile = mapUserProfileRowToDomain(data as UserProfileRow);
  return {
    ...session,
    displayName: profile.displayName,
    preferences: profile.preferences,
  };
};

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

      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options:
          Object.keys(metadata).length > 0 ? { data: metadata } : undefined,
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

      const baseSession = mapSupabaseSessionToDomain(
        data.session!,
        data.user!.email || input.email
      );
      const session = await enrichSessionWithProfile(client, baseSession);

      return { session, requiresEmailVerification: false };
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

      const baseSession = mapSupabaseSessionToDomain(
        data.session!,
        data.user!.email || input.email
      );
      const session = await enrichSessionWithProfile(client, baseSession);

      return { session, requiresEmailVerification: false };
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

      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        handleAuthError(error);
      }
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

  async getSession(): Promise<AuthSession | null> {
    try {
      const isServerContext = typeof window === "undefined";

      if (isServerContext) {
        // Security-first server path: always validate auth with Supabase.
        const {
          data: { user },
          error,
        } = await client.auth.getUser();

        if (error) {
          const isAuthSessionMissingError =
            error &&
            typeof error === "object" &&
            "name" in error &&
            error.name === "AuthSessionMissingError" &&
            "message" in error &&
            error.message === "Auth session missing!";

          if (isAuthSessionMissingError) {
            return null;
          }

          handleAuthError(error);
        }

        if (!user) {
          return null;
        }

        const userEmail = user.email;
        if (!userEmail) {
          const error: AuthenticationError = {
            code: "AUTHENTICATION_ERROR",
            debugMessage: "User email not found in authenticated user data",
          };
          handleAuthError(error);
        }

        // Server-side flow has no direct session token available from getUser().
        const baseSession: AuthSession = {
          userId: user.id,
          email: userEmail!,
          displayName: null,
          preferences: { ...DEFAULT_USER_PREFERENCES },
          accessToken: "",
          isSuperuser: user.app_metadata?.is_superuser === true,
        };

        return enrichSessionWithProfile(client, baseSession);
      } else {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();

        if (error) {
          handleAuthError(error);
        }

        if (!session) {
          return null;
        }

        const userEmail = session.user.email;
        if (!userEmail) {
          const error: AuthenticationError = {
            code: "AUTHENTICATION_ERROR",
            debugMessage: "User email not found in session",
          };
          handleAuthError(error);
        }

        const baseSession = mapSupabaseSessionToDomain(session, userEmail!);
        return enrichSessionWithProfile(client, baseSession);
      }
    } catch (error) {
      return handleAuthError(error);
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

        const { error: updateError } = await client.auth.updateUser({
          password: input.password,
        });

        if (updateError) {
          handleAuthError(updateError);
        }

        const userEmail = verifyData.user!.email || input.email!;
        const baseSession = mapSupabaseSessionToDomain(
          verifyData.session!,
          userEmail
        );
        const session = await enrichSessionWithProfile(client, baseSession);
        return { session, requiresEmailVerification: false };
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

      const baseSession = mapSupabaseSessionToDomain(
        sessionData.session,
        user.email || ""
      );
      const session = await enrichSessionWithProfile(client, baseSession);
      return { session, requiresEmailVerification: false };
    } catch (error) {
      return handleAuthError(error);
    }
  },

  async verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
    try {
      // If email is not provided, Supabase redirects with only a code.
      // The Supabase client automatically exchanges the code for a session
      // during initialization — no artificial delay needed.
      if (!input.email || input.email.trim() === "") {
        const { data: sessionData, error: sessionError } =
          await client.auth.getSession();

        if (sessionError) {
          return handleAuthError(sessionError);
        }

        // If we have a session, verify the user's email confirmation
        if (sessionData.session) {
          const {
            data: { user },
            error: userError,
          } = await client.auth.getUser();

          if (userError) {
            return handleAuthError(userError);
          }

          if (user) {
            const userEmail = user.email || "";
            const baseSession = mapSupabaseSessionToDomain(
              sessionData.session,
              userEmail
            );
            const session = await enrichSessionWithProfile(client, baseSession);
            return { session, requiresEmailVerification: false };
          }
        }

        // If no session, the code is invalid or expired
        const error: EmailVerificationError = {
          code: "EMAIL_VERIFICATION_ERROR",
          debugMessage:
            "Unable to verify email. The verification code may be invalid or expired. Please request a new verification email.",
        };
        return handleAuthError(error);
      }

      // Standard verification with email and token
      // TypeScript: input.email is guaranteed to be non-empty after the check above
      if (!input.email) {
        const error: EmailVerificationError = {
          code: "EMAIL_VERIFICATION_ERROR",
          debugMessage: "Email is required for email verification",
        };
        handleAuthError(error);
      }

      // TypeScript: input.email is guaranteed to be non-empty after the check above
      const { data, error } = await client.auth.verifyOtp({
        email: input.email!,
        token: input.token,
        type: "email",
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

      const userEmail = data.user!.email || input.email! || "";
      const baseSession = mapSupabaseSessionToDomain(data.session!, userEmail);
      const session = await enrichSessionWithProfile(client, baseSession);

      return { session, requiresEmailVerification: false };
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
