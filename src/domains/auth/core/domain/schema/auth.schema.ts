import { z } from "zod";

import {
  DEFAULT_LANGUAGE,
  PASSWORD_LIMITS,
} from "@/domains/auth/core/domain/constants/auth.constants";

/**
 * Reusable Zod schema for password validation.
 * Validates password length requirements.
 */
const PasswordSchema = z
  .string()
  .min(
    PASSWORD_LIMITS.MIN_LENGTH,
    `Password must be at least ${PASSWORD_LIMITS.MIN_LENGTH} characters`
  )
  .max(
    PASSWORD_LIMITS.MAX_LENGTH,
    `Password must be less than ${PASSWORD_LIMITS.MAX_LENGTH} characters`
  );

/**
 * Zod schema for user signup input.
 * Validates email format, password requirements, optional display name,
 * and optional terms acceptance timestamp.
 * displayName and termsAcceptedAt are stored in the user_profiles table
 * via the signup trigger.
 */
export const SignUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email format" }),
  password: PasswordSchema,
  displayName: z
    .string()
    .trim()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  termsAcceptedAt: z.string().optional(),
});

/**
 * Signup input type.
 */
export type SignUpInput = z.infer<typeof SignUpSchema>;

/**
 * Zod schema for signup form (UI validation).
 * Includes password confirmation and mandatory terms acceptance.
 * This schema is used in the presentation layer for form validation.
 * The domain schema (SignUpSchema) is used for API validation.
 */
export const SignUpFormSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email({ message: "Invalid email format" }),
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
    displayName: z
      .string()
      .trim()
      .max(100, "Display name must be less than 100 characters")
      .optional(),
    acceptedTerms: z.literal(true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Signup form input type (includes confirmPassword and acceptedTerms for UI validation).
 */
export type SignUpFormInput = z.infer<typeof SignUpFormSchema>;

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
 * Zod schema for user preferences stored in user_profiles.preferences.
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
  language: DEFAULT_LANGUAGE,
};

/**
 * Input for partial preference updates.
 * Only the fields provided will be merged with existing preferences.
 */
export type UpdatePreferencesInput = Partial<UserPreferences>;

/**
 * Authentication session data.
 * Represents an authenticated user session.
 * displayName and preferences come from the user_profiles table (single source of truth).
 * isSuperuser comes from Supabase app_metadata.is_superuser (server-controlled, not user-editable).
 */
export type AuthSession = {
  userId: string;
  email: string;
  displayName: string | null;
  preferences: UserPreferences;
  accessToken: string;
  isSuperuser: boolean;
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
 * Validates password requirements.
 * Token and email are optional: when using the PKCE callback flow,
 * the session is already established and no token/email is needed.
 */
export const UpdatePasswordSchema = z.object({
  password: PasswordSchema,
  token: z.string().min(1, "Token is required").optional(),
  email: z
    .union([
      z.string().email({ message: "Invalid email format" }),
      z.literal(""),
    ])
    .optional(),
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
 * Zod schema for updating auth credentials (email and/or password).
 * Profile data is managed via UserProfileRepository, not through auth.
 */
export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: PasswordSchema.optional(),
});

/**
 * Auth credential update input type.
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
 * Error when the new password is the same as the current one.
 */
export type SamePasswordError = AuthError & {
  code: "SAME_PASSWORD";
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
  | InvalidTokenError
  | SamePasswordError;

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
