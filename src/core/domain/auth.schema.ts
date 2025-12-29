import { z } from "zod";

/**
 * Zod schema for user signup input.
 * Validates email format and password requirements.
 */
export const SignUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
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
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
  password: z.string().min(1, "Password is required"),
});

/**
 * Signin input type.
 */
export type SignInInput = z.infer<typeof SignInSchema>;

/**
 * Base authentication error type.
 * Errors contain only codes and metadata - no user-facing messages.
 * User-facing messages are translated in the presentation layer using i18n.
 */
export type AuthError = {
  code: string;
  /**
   * Optional debug message for logging purposes only.
   * Never shown to users - use error.code with i18n for user-facing messages.
   */
  debugMessage?: string;
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

/**
 * Zod schema for password reset request input.
 * Validates email format.
 */
export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
});

/**
 * Password reset request input type.
 */
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

/**
 * Zod schema for password update input.
 * Validates password requirements and token presence.
 * Email is optional when using code format (Supabase redirects with code only).
 * Accepts valid email string, empty string, or undefined.
 */
export const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  token: z.string().min(1, "Token is required"),
  email: z
    .union([
      z.string().email({ message: "Invalid email format" }),
      z.literal(""),
    ])
    .optional(), // Allow empty string or undefined for code-only format
});

/**
 * Password update input type.
 */
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;

/**
 * Zod schema for email verification input.
 * Validates email format and token presence.
 * Email is optional when using code format (Supabase redirects with code only).
 * Accepts valid email string, empty string, or undefined.
 */
export const VerifyEmailSchema = z.object({
  email: z
    .union([
      z.string().email({ message: "Invalid email format" }),
      z.literal(""),
    ])
    .optional(), // Allow empty string or undefined for code-only format
  token: z.string().min(1, "Token is required"),
});

/**
 * Email verification input type.
 */
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

/**
 * Zod schema for updating user information.
 * All fields are optional - user can update email, password, or metadata.
 */
export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters")
    .optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update user input type.
 */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Error when email verification fails (expired or invalid token).
 */
export type EmailVerificationError = AuthError & {
  code: "EMAIL_VERIFICATION_ERROR";
};

/**
 * Error when password reset fails (expired or invalid token, email not found).
 */
export type PasswordResetError = AuthError & {
  code: "PASSWORD_RESET_ERROR";
};

/**
 * Error when token is invalid or expired.
 */
export type InvalidTokenError = AuthError & {
  code: "INVALID_TOKEN";
};

/**
 * Union type of all possible authentication errors.
 */
export type AuthenticationFailure =
  | InvalidCredentialsError
  | EmailAlreadyExistsError
  | WeakPasswordError
  | InvalidEmailError
  | AuthenticationError
  | EmailVerificationError
  | PasswordResetError
  | InvalidTokenError;
