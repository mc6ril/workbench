import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AuthResult,
  AuthSession,
  SignInInput,
  SignUpInput,
} from "@/core/domain/auth/auth.schema";

import { mapSupabaseSessionToDomain } from "@/infrastructure/supabase/mappers/authMapper";
import { mapSupabaseAuthError } from "@/infrastructure/supabase/utils/authErrorMapper";

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
        throw mapSupabaseAuthError(error);
      }

      if (!data.session || !data.user) {
        throw mapSupabaseAuthError(
          new Error("No session or user returned from signup")
        );
      }

      const session = mapSupabaseSessionToDomain(
        data.session,
        data.user.email || input.email
      );

      return { session };
    } catch (error) {
      // Re-throw domain errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string" &&
        [
          "INVALID_CREDENTIALS",
          "EMAIL_ALREADY_EXISTS",
          "WEAK_PASSWORD",
          "INVALID_EMAIL",
          "AUTHENTICATION_ERROR",
        ].includes(error.code)
      ) {
        throw error;
      }
      // Map unknown errors
      throw mapSupabaseAuthError(error);
    }
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw mapSupabaseAuthError(error);
      }

      if (!data.session || !data.user) {
        throw mapSupabaseAuthError(
          new Error("No session or user returned from signin")
        );
      }

      const session = mapSupabaseSessionToDomain(
        data.session,
        data.user.email || input.email
      );

      return { session };
    } catch (error) {
      // Re-throw domain errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string" &&
        [
          "INVALID_CREDENTIALS",
          "EMAIL_ALREADY_EXISTS",
          "WEAK_PASSWORD",
          "INVALID_EMAIL",
          "AUTHENTICATION_ERROR",
        ].includes(error.code)
      ) {
        throw error;
      }
      // Map unknown errors
      throw mapSupabaseAuthError(error);
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await client.auth.signOut();

      if (error) {
        throw mapSupabaseAuthError(error);
      }
    } catch (error) {
      // Re-throw domain errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string" &&
        [
          "INVALID_CREDENTIALS",
          "EMAIL_ALREADY_EXISTS",
          "WEAK_PASSWORD",
          "INVALID_EMAIL",
          "AUTHENTICATION_ERROR",
        ].includes(error.code)
      ) {
        throw error;
      }
      // Map unknown errors
      throw mapSupabaseAuthError(error);
    }
  },

  async getSession(): Promise<AuthSession | null> {
    try {
      // Use getUser() for server-side authentication to verify the user
      // This authenticates the data by contacting the Supabase Auth server
      // instead of reading directly from cookies (which can be manipulated)
      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      if (error) {
        throw mapSupabaseAuthError(error);
      }

      if (!user) {
        return null;
      }

      // Get user email from authenticated user data
      const userEmail = user.email;
      if (!userEmail) {
        // If email is not in user data, throw an error as we need the email
        throw mapSupabaseAuthError(
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
    } catch (error) {
      // Re-throw domain errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string" &&
        [
          "INVALID_CREDENTIALS",
          "EMAIL_ALREADY_EXISTS",
          "WEAK_PASSWORD",
          "INVALID_EMAIL",
          "AUTHENTICATION_ERROR",
        ].includes(error.code)
      ) {
        throw error;
      }
      // Map unknown errors
      throw mapSupabaseAuthError(error);
    }
  },
});
