import { z } from "zod";

import { APP_LIMITS } from "@/shared/constants/app";
import { defaultLocale } from "@/shared/i18n/config";

/**
 * Reusable Zod schema for password validation.
 * Validates password length requirements.
 */
const PasswordSchema = z
  .string()
  .min(
    APP_LIMITS.PASSWORD.MIN_LENGTH,
    `Password must be at least ${APP_LIMITS.PASSWORD.MIN_LENGTH} characters`
  )
  .max(
    APP_LIMITS.PASSWORD.MAX_LENGTH,
    `Password must be less than ${APP_LIMITS.PASSWORD.MAX_LENGTH} characters`
  );

/**
 * Zod schema for user signup input.
 * Validates email format and password requirements.
 */
export const SignUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
  password: PasswordSchema,
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
 * Allowed theme values: light, dark, or system (follows OS preference).
 */
export const ThemeValues = ["light", "dark", "system"] as const;
export type Theme = (typeof ThemeValues)[number];

/**
 * Zod schema for user preferences stored in Supabase user_metadata.
 * Preferences are synced across devices via the auth session.
 */
export const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  language: z.string().min(1),
});

/**
 * User preferences (theme, notifications, language).
 */
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/**
 * Default preferences applied to new users or when stored preferences are missing/invalid.
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "system",
  emailNotifications: true,
  language: defaultLocale,
};

/**
 * Input for partial preference updates.
 * Only the fields provided will be merged with existing preferences.
 */
export type UpdatePreferencesInput = Partial<UserPreferences>;

/**
 * Authentication session data.
 * Represents an authenticated user session.
 * displayName comes from Supabase user_metadata.display_name.
 * preferences comes from Supabase user_metadata.preferences.
 */
export type AuthSession = {
  userId: string;
  email: string;
  displayName: string | null;
  preferences: UserPreferences;
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
 * Email is optional when using code format (external systems may redirect with code only).
 * Accepts valid email string, empty string, or undefined.
 */
export const UpdatePasswordSchema = z.object({
  password: PasswordSchema,
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
 * Zod schema for update password form (UI validation).
 * Includes password confirmation field for form validation.
 * This schema is used in the presentation layer for form validation.
 * The domain schema (UpdatePasswordSchema) is used for API validation.
 */
export const UpdatePasswordFormSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Update password form input type.
 */
export type UpdatePasswordFormInput = z.infer<typeof UpdatePasswordFormSchema>;

/**
 * Zod schema for email verification input.
 * Validates email format and token presence.
 * Email is optional when using code format (external systems may redirect with code only).
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
  password: PasswordSchema.optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update user input type.
 */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Input type for updating user profile (display name and email).
 * Used by the account page to update personal information.
 */
export type UpdateProfileInput = {
  displayName?: string;
  email?: string;
};

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

/**
 * Zod schema for changing password from account settings.
 * Validates current password presence, new password requirements, and confirmation match.
 */
export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Change password form input type.
 */
export type ChangePasswordFormInput = z.infer<typeof ChangePasswordFormSchema>;

/**
 * Zod schema for resend verification email input.
 * Validates email format.
 */
export const ResendVerificationEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});
