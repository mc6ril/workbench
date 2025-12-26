import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AuthResult,
  AuthSession,
  SignInInput,
  SignUpInput,
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
        handleAuthError(new Error("User data not returned from signup"));
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
        handleAuthError(new Error("No session or user returned from signin"));
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
          handleAuthError(
            new Error("User email not found in authenticated user data")
          );
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
          handleAuthError(new Error("User email not found in session"));
        }

        return mapSupabaseSessionToDomain(session, userEmail);
      }
    } catch (error) {
      handleAuthError(error);
    }
  },
});
