import type {
  AuthResult,
  AuthSession,
  SignInInput,
  SignUpInput,
} from "@/core/domain/auth/auth.schema";

import { supabaseClient } from "@/infrastructure/supabase/client";
import { mapSupabaseSessionToDomain } from "@/infrastructure/supabase/mappers/authMapper";
import { mapSupabaseAuthError } from "@/infrastructure/supabase/utils/authErrorMapper";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Supabase implementation of AuthRepository.
 * Handles all authentication operations using Supabase Auth client.
 */
export const authRepositorySupabase: AuthRepository = {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
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
      const { data, error } = await supabaseClient.auth.signInWithPassword({
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
      const { error } = await supabaseClient.auth.signOut();

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
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) {
        throw mapSupabaseAuthError(error);
      }

      if (!session) {
        return null;
      }

      // Get user email from session or fetch user if needed
      const userEmail = session.user.email;
      if (!userEmail) {
        // If email is not in session, it might be in user metadata
        // For now, throw an error as we need the email
        throw mapSupabaseAuthError(
          new Error("User email not found in session")
        );
      }

      return mapSupabaseSessionToDomain(session, userEmail);
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
};
