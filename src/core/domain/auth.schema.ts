import { z } from "zod";

/**
 * Zod schema for user signup input.
 * Validates email format and password requirements.
 */
export const SignUpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

/**
 * Signup input type.
 */
export type SignUpInput = z.infer<typeof SignUpSchema>;

/**
 * Zod schema for user signin input.
 * Validates email format and password presence.
 */
export const SignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Signin input type.
 */
export type SignInInput = z.infer<typeof SignInSchema>;

/**
 * Base authentication error type.
 */
export type AuthError = {
  message: string;
  code: string;
};

/**
 * Error when credentials are invalid (wrong email or password).
 */
export type InvalidCredentialsError = AuthError & {
  code: "INVALID_CREDENTIALS";
};

/**
 * Error when email is already registered.
 */
export type EmailAlreadyExistsError = AuthError & {
  code: "EMAIL_ALREADY_EXISTS";
};

/**
 * Error when password doesn't meet requirements.
 */
export type WeakPasswordError = AuthError & {
  code: "WEAK_PASSWORD";
};

/**
 * Error when email format is invalid.
 */
export type InvalidEmailError = AuthError & {
  code: "INVALID_EMAIL";
};

/**
 * Error when authentication operation fails due to network or server issues.
 */
export type AuthenticationError = AuthError & {
  code: "AUTHENTICATION_ERROR";
  originalError?: unknown;
};

/**
 * Union type of all possible authentication errors.
 */
export type AuthenticationFailure =
  | InvalidCredentialsError
  | EmailAlreadyExistsError
  | WeakPasswordError
  | InvalidEmailError
  | AuthenticationError;

/**
 * Authentication session data.
 * Represents an authenticated user session.
 */
export type AuthSession = {
  userId: string;
  email: string;
  accessToken: string;
};

/**
 * Authentication result for signup/signin operations.
 * When email verification is required, session will be null and requiresEmailVerification will be true.
 */
export type AuthResult = {
  session: AuthSession | null;
  requiresEmailVerification?: boolean;
};
