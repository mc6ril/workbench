import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AuthenticationError,
  AuthResult,
  AuthSession,
  EmailVerificationError,
  InvalidTokenError,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/core/domain/auth.schema";

import { mapSupabaseSessionToDomain } from "@/infrastructure/supabase/auth/AuthMapper.supabase";
import { handleAuthError } from "@/infrastructure/supabase/shared/errors/errorHandlers";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Create an AuthRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns AuthRepository implementation
 */
export const createAuthRepository = (
  client: SupabaseClient
): AuthRepository => ({
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
      });

      if (error) {
        handleAuthError(error);
      }

      // Handle email verification case: Supabase returns null session when email verification is required
      if (!data.session) {
        return {
          session: null,
          requiresEmailVerification: true,
        };
      }

      // Session exists: user is automatically logged in (email verification not required or already verified)
      if (!data.user) {
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage: "User data not returned from signup",
        };
        handleAuthError(error);
      }

      const session = mapSupabaseSessionToDomain(
        data.session,
        data.user.email || input.email
      );

      return { session, requiresEmailVerification: false };
    } catch (error) {
      handleAuthError(error);
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

      const session = mapSupabaseSessionToDomain(
        data.session,
        data.user.email || input.email
      );

      // SignIn always returns a session (no email verification needed for existing users)
      return { session, requiresEmailVerification: false };
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
      // Check if this is a server client by trying to detect server-side context
      // For browser clients, use getSession() (reads from cookies, faster)
      // For server clients, use getUser() (validates with Auth server, more secure)
      const isServerContext = typeof window === "undefined";

      if (isServerContext) {
        // Server-side: use getUser() to validate with Auth server
        const {
          data: { user },
          error,
        } = await client.auth.getUser();

        if (error) {
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

        // Map authenticated user directly to AuthSession
        // Note: accessToken is empty string for server-side checks as getUser()
        // doesn't return tokens, but we only need user info for authentication verification
        return {
          userId: user.id,
          email: userEmail,
          accessToken: "", // Not available from getUser(), but not needed for server-side auth checks
        };
      } else {
        // Browser-side: use getSession() to read from cookies (faster)
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

        return mapSupabaseSessionToDomain(session, userEmail);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },

  async resetPasswordForEmail(input: ResetPasswordInput): Promise<void> {
    try {
      // Determine redirect URL based on context
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/update-password`
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
      // If email is not provided, Supabase redirects with only a code
      // The Supabase client automatically exchanges the code for a session
      // when getSession() is called after the code is in the URL
      if (!input.email || input.email.trim() === "") {
        // Wait a bit for Supabase to process the code from URL
        // Then get the session (Supabase client handles code exchange automatically)
        await new Promise((resolve) => setTimeout(resolve, 100));

        const { data: sessionData, error: sessionError } =
          await client.auth.getSession();

        if (sessionError) {
          handleAuthError(sessionError);
        }

        // If we have a session, update the password
        if (sessionData.session) {
          const { error: updateError } = await client.auth.updateUser({
            password: input.password,
          });

          if (updateError) {
            handleAuthError(updateError);
          }

          // Get the user to get the email
          const {
            data: { user },
            error: userError,
          } = await client.auth.getUser();

          if (userError) {
            handleAuthError(userError);
          }

          if (user) {
            const userEmail = user.email || "";
            const session = mapSupabaseSessionToDomain(
              sessionData.session,
              userEmail
            );
            return { session, requiresEmailVerification: false };
          }
        }

        // If no session, the code might be invalid or expired
        const error: InvalidTokenError = {
          code: "INVALID_TOKEN",
          debugMessage:
            "Unable to reset password. The reset code may be invalid or expired. Please request a new password reset email.",
        };
        handleAuthError(error);
      }

      // Standard password reset with email and token
      const { data: verifyData, error: verifyError } =
        await client.auth.verifyOtp({
          email: input.email,
          token: input.token,
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

      // Update the password
      const { error: updateError } = await client.auth.updateUser({
        password: input.password,
      });

      if (updateError) {
        handleAuthError(updateError);
      }

      // Map session to domain
      const userEmail = verifyData.user.email || input.email;
      const session = mapSupabaseSessionToDomain(verifyData.session, userEmail);

      return { session, requiresEmailVerification: false };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
    try {
      // If email is not provided, Supabase redirects with only a code
      // The Supabase client automatically exchanges the code for a session
      // when getSession() is called after the code is in the URL
      if (!input.email || input.email.trim() === "") {
        // Wait a bit for Supabase to process the code from URL
        // Then get the session (Supabase client handles code exchange automatically)
        await new Promise((resolve) => setTimeout(resolve, 100));

        const { data: sessionData, error: sessionError } =
          await client.auth.getSession();

        if (sessionError) {
          handleAuthError(sessionError);
        }

        // If we have a session, get the user to verify email confirmation
        if (sessionData.session) {
          const {
            data: { user },
            error: userError,
          } = await client.auth.getUser();

          if (userError) {
            handleAuthError(userError);
          }

          if (user) {
            const userEmail = user.email || "";
            const session = mapSupabaseSessionToDomain(
              sessionData.session,
              userEmail
            );
            return { session, requiresEmailVerification: false };
          }
        }

        // If no session, the code might be invalid or expired
        const error: EmailVerificationError = {
          code: "EMAIL_VERIFICATION_ERROR",
          debugMessage:
            "Unable to verify email. The verification code may be invalid or expired. Please request a new verification email.",
        };
        handleAuthError(error);
      }

      // Standard verification with email and token
      const { data, error } = await client.auth.verifyOtp({
        email: input.email,
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

      const userEmail = data.user.email || input.email || "";
      const session = mapSupabaseSessionToDomain(data.session, userEmail);

      return { session, requiresEmailVerification: false };
    } catch (error) {
      handleAuthError(error);
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
    data?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const updateData: {
        email?: string;
        password?: string;
        data?: Record<string, unknown>;
      } = {};

      if (input.email) {
        updateData.email = input.email;
      }

      if (input.password) {
        updateData.password = input.password;
      }

      if (input.data) {
        updateData.data = input.data;
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
      // User deletion requires admin API (service_role key)
      // Call Next.js API route which handles server-side deletion
      const response = await fetch("/api/auth/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: AuthenticationError = {
          code: "AUTHENTICATION_ERROR",
          debugMessage:
            errorData.error || `Failed to delete user: ${response.statusText}`,
        };
        handleAuthError(error);
      }

      // User deletion successful
      return;
    } catch (error) {
      handleAuthError(error);
    }
  },
});
