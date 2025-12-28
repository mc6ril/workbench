import type {
  AuthResult,
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
  VerifyEmailInput,
} from "@/core/domain/auth.schema";

/**
 * Mock type for AuthRepository.
 * Used for type-safe mock creation in tests.
 */
export type AuthRepositoryMock = {
  signUp: jest.Mock<Promise<AuthResult>, [SignUpInput]>;
  signIn: jest.Mock<Promise<AuthResult>, [SignInInput]>;
  signOut: jest.Mock<Promise<void>, []>;
  getSession: jest.Mock<Promise<AuthSession | null>, []>;
  resetPasswordForEmail: jest.Mock<Promise<void>, [ResetPasswordInput]>;
  updatePassword: jest.Mock<Promise<AuthResult>, [UpdatePasswordInput]>;
  verifyEmail: jest.Mock<Promise<AuthResult>, [VerifyEmailInput]>;
  resendVerificationEmail: jest.Mock<Promise<void>, [string]>;
  updateUser: jest.Mock<
    Promise<void>,
    [
      {
        email?: string;
        password?: string;
        data?: Record<string, unknown>;
      },
    ]
  >;
  deleteUser: jest.Mock<Promise<void>, []>;
};

type AuthRepositoryMockOverrides = Partial<AuthRepositoryMock>;

/**
 * Factory for creating a mock AuthRepository.
 *
 * Tests can override only the methods they need while keeping the rest as jest.fn().
 *
 * @param overrides - Partial mock to override specific methods
 * @returns A mock AuthRepository
 */
export const createAuthRepositoryMock = (
  overrides: AuthRepositoryMockOverrides = {}
): AuthRepositoryMock => {
  const base: AuthRepositoryMock = {
    signUp: jest.fn<Promise<AuthResult>, [SignUpInput]>(),
    signIn: jest.fn<Promise<AuthResult>, [SignInInput]>(),
    signOut: jest.fn<Promise<void>, []>(),
    getSession: jest.fn<Promise<AuthSession | null>, []>(),
    resetPasswordForEmail: jest.fn<Promise<void>, [ResetPasswordInput]>(),
    updatePassword: jest.fn<Promise<AuthResult>, [UpdatePasswordInput]>(),
    verifyEmail: jest.fn<Promise<AuthResult>, [VerifyEmailInput]>(),
    resendVerificationEmail: jest.fn<Promise<void>, [string]>(),
    updateUser: jest.fn<
      Promise<void>,
      [
        {
          email?: string;
          password?: string;
          data?: Record<string, unknown>;
        },
      ]
    >(),
    deleteUser: jest.fn<Promise<void>, []>(),
  };

  return {
    ...base,
    ...overrides,
  };
};

