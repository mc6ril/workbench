import {
  mapSupabaseAuthError,
  mapSupabaseSessionToDomain,
} from "@/infrastructure/supabase/auth/AuthMapper.supabase";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthError } from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createSupabaseAuthError,
  createSupabaseSessionMock,
} from "../../../../__mocks__/infrastructure/supabase/authMocks";

describe("AuthMapper.supabase", () => {
  describe("mapSupabaseSessionToDomain", () => {
    it("should map Supabase session to domain AuthSession", () => {
      // Arrange
      const supabaseSession = createSupabaseSessionMock();
      const userEmail = "test@example.com";

      // Act
      const result = mapSupabaseSessionToDomain(supabaseSession, userEmail);

      // Assert
      expect(result).toEqual({
        userId: "user-123",
        email: "test@example.com",
        accessToken: "test-access-token",
      });
    });

    it("should use provided email instead of session user email", () => {
      // Arrange
      const supabaseSession = createSupabaseSessionMock({
        user: {
          email: "original@example.com",
        },
      });
      const userEmail = "different@example.com";

      // Act
      const result = mapSupabaseSessionToDomain(supabaseSession, userEmail);

      // Assert
      expect(result.email).toBe("different@example.com");
      expect(result.userId).toBe("user-123");
      expect(result.accessToken).toBe("test-access-token");
    });
  });

  describe("mapSupabaseAuthError", () => {
    describe("Email not confirmed errors", () => {
      it("should map email_not_confirmed code to EmailVerificationError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailNotConfirmed();
        const expectedError = createAuthError.emailVerification();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map email not confirmed message to EmailVerificationError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailNotConfirmed(
          "Email not confirmed"
        );
        const expectedError = createAuthError.emailVerification();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map email address not confirmed message to EmailVerificationError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailNotConfirmed(
          "Email address not confirmed"
        );
        const expectedError = createAuthError.emailVerification();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Invalid credentials errors", () => {
      it("should map status 400 with invalid login credentials message to InvalidCredentialsError", () => {
        // Arrange
        const authError = createSupabaseAuthError.invalidCredentials();
        const expectedError = createAuthError.invalidCredentials();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map status 400 with invalid password message to InvalidCredentialsError", () => {
        // Arrange
        const authError =
          createSupabaseAuthError.invalidCredentials("Invalid password");
        const expectedError = createAuthError.invalidCredentials();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map status 400 with user not found message to InvalidCredentialsError", () => {
        // Arrange
        const authError =
          createSupabaseAuthError.invalidCredentials("User not found");
        const expectedError = createAuthError.invalidCredentials();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map invalid_credentials code to InvalidCredentialsError", () => {
        // Arrange
        const authError = createSupabaseAuthError.invalidCredentialsCode();
        const expectedError = createAuthError.invalidCredentials();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Email already exists errors", () => {
      it("should map user already registered message to EmailAlreadyExistsError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailAlreadyExists();
        const expectedError = createAuthError.emailAlreadyExists();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map email already exists message to EmailAlreadyExistsError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailAlreadyExists(
          "Email already exists"
        );
        const expectedError = createAuthError.emailAlreadyExists();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map signup_disabled code to EmailAlreadyExistsError", () => {
        // Arrange
        const authError = createSupabaseAuthError.signupDisabled();
        const expectedError = createAuthError.emailAlreadyExists();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Weak password errors", () => {
      it("should map password weak message to WeakPasswordError", () => {
        // Arrange
        const authError = createSupabaseAuthError.weakPassword();
        const expectedError = createAuthError.weakPassword();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map password too short message to WeakPasswordError", () => {
        // Arrange
        const authError = createSupabaseAuthError.weakPassword(
          "Password is too short"
        );
        const expectedError = createAuthError.weakPassword();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map password requirements message to WeakPasswordError", () => {
        // Arrange
        const authError = createSupabaseAuthError.weakPassword(
          "Password does not meet requirements"
        );
        const expectedError = createAuthError.weakPassword();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Invalid email format errors", () => {
      it("should map invalid email message to InvalidEmailError", () => {
        // Arrange
        const authError = createSupabaseAuthError.invalidEmail();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", "INVALID_EMAIL");
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map email format message to InvalidEmailError", () => {
        // Arrange
        const authError = createSupabaseAuthError.invalidEmail(
          "Invalid email format"
        );

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", "INVALID_EMAIL");
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map validation_failed code to InvalidEmailError", () => {
        // Arrange
        const authError = createSupabaseAuthError.validationFailed();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", "INVALID_EMAIL");
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Email verification errors", () => {
      it("should map email verification message to EmailVerificationError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailVerification();
        const expectedError = createAuthError.emailVerification();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map verification failed message to EmailVerificationError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailVerification(
          "Verification failed"
        );
        const expectedError = createAuthError.emailVerification();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map token expired in email verification to InvalidTokenError", () => {
        // Arrange
        const authError = createSupabaseAuthError.tokenExpired(
          "Token expired during email verification"
        );
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map invalid token in email verification to InvalidTokenError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailVerification(
          "Invalid token for email verification"
        );
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Password reset errors", () => {
      it("should map password reset message to PasswordResetError", () => {
        // Arrange
        const authError = createSupabaseAuthError.passwordReset();
        const expectedError = createAuthError.passwordReset();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map reset failed message to PasswordResetError", () => {
        // Arrange
        const authError = createSupabaseAuthError.passwordReset("Reset failed");
        const expectedError = createAuthError.passwordReset();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map email_not_found code to PasswordResetError", () => {
        // Arrange
        const authError = createSupabaseAuthError.emailNotFound();
        const expectedError = createAuthError.passwordReset();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map expired token in password reset to InvalidTokenError", () => {
        // Arrange - message contains "password reset" and "expired"
        const authError = createSupabaseAuthError.passwordReset(
          "Password reset expired"
        );
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map invalid token in password reset to InvalidTokenError", () => {
        // Arrange - message contains "password reset" and "invalid token"
        const authError = createSupabaseAuthError.passwordReset(
          "Password reset invalid token"
        );
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map email_not_found code with expired message to InvalidTokenError", () => {
        // Arrange - code is email_not_found (matches password reset) and message contains "expired"
        const authError =
          createSupabaseAuthError.emailNotFound("Token expired");
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Invalid token errors (general)", () => {
      it("should map invalid token message to InvalidTokenError", () => {
        // Arrange
        const authError = createSupabaseAuthError.invalidToken();
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map token expired message to InvalidTokenError", () => {
        // Arrange
        const authError = createSupabaseAuthError.tokenExpired();
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map invalid_token code to InvalidTokenError", () => {
        // Arrange
        const authError = createSupabaseAuthError.invalidToken();
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map token_expired code to InvalidTokenError", () => {
        // Arrange
        const authError = createSupabaseAuthError.tokenExpired();
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map invalid_token code to InvalidTokenError (not matching password reset)", () => {
        // Arrange - code is invalid_token but message doesn't match password reset patterns
        // This should reach the "Invalid token (general)" block (line 214)
        const authError = createSupabaseAuthError.invalidToken();
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map token_expired code with non-password-reset message to InvalidTokenError", () => {
        // Arrange - code is token_expired but message doesn't match password reset
        // This should reach the "Invalid token (general)" block (line 214)
        const authError =
          createSupabaseAuthError.tokenExpired("Token has expired");
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map invalid_token code to InvalidTokenError when message doesn't contain token word", () => {
        // Arrange - code is invalid_token but message doesn't contain "token"
        // This bypasses email verification block (which checks for "token" in message)
        // and password reset block, reaching "Invalid token (general)" block (line 214)
        const authError = createSupabaseAuthError.invalidToken(
          "Invalid authorization"
        );
        const expectedError = createAuthError.invalidToken();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });
    });

    describe("Generic Error instances", () => {
      it("should map Error with invalid credentials message to InvalidCredentialsError", () => {
        // Arrange
        const error = new Error("Invalid credentials");
        const expectedError = createAuthError.invalidCredentials();

        // Act
        const result = mapSupabaseAuthError(error);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map Error with invalid password message to InvalidCredentialsError", () => {
        // Arrange
        const error = new Error("Invalid password provided");
        const expectedError = createAuthError.invalidCredentials();

        // Act
        const result = mapSupabaseAuthError(error);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map Error with email already message to EmailAlreadyExistsError", () => {
        // Arrange
        const error = new Error("Email already exists");
        const expectedError = createAuthError.emailAlreadyExists();

        // Act
        const result = mapSupabaseAuthError(error);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map Error with password weak message to WeakPasswordError", () => {
        // Arrange
        const error = new Error("Password is too weak");
        const expectedError = createAuthError.weakPassword();

        // Act
        const result = mapSupabaseAuthError(error);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map generic Error to AuthenticationError", () => {
        // Arrange
        const error = new Error("Generic authentication error");
        const expectedError = createAuthError.authentication();

        // Act
        const result = mapSupabaseAuthError(error);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", error);
      });
    });

    describe("Unknown errors (fallback)", () => {
      it("should map null to AuthenticationError with fallback message", () => {
        // Arrange
        const unknownError = null;
        const expectedError = createAuthError.authentication(
          "An unknown authentication error occurred"
        );

        // Act
        const result = mapSupabaseAuthError(unknownError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", unknownError);
      });

      it("should map string error to AuthenticationError with fallback message", () => {
        // Arrange
        const unknownError = "String error";
        const expectedError = createAuthError.authentication(
          "An unknown authentication error occurred"
        );

        // Act
        const result = mapSupabaseAuthError(unknownError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", unknownError);
      });

      it("should map object without status to AuthenticationError with fallback message", () => {
        // Arrange
        const unknownError = {
          message: "Some error",
          // Missing status property
        };
        const expectedError = createAuthError.authentication(
          "An unknown authentication error occurred"
        );

        // Act
        const result = mapSupabaseAuthError(unknownError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", unknownError);
      });

      it("should map object without message to AuthenticationError with fallback message", () => {
        // Arrange
        const unknownError = {
          status: 400,
          // Missing message property
        };
        const expectedError = createAuthError.authentication(
          "An unknown authentication error occurred"
        );

        // Act
        const result = mapSupabaseAuthError(unknownError);

        // Assert
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", unknownError);
      });
    });

    describe("Error precedence and edge cases", () => {
      it("should prioritize email_not_confirmed code over message content", () => {
        // Arrange - message says invalid credentials but code says email not confirmed
        const authError = createSupabaseAuthError.emailNotConfirmed(
          "Invalid login credentials"
        );
        const expectedError = createAuthError.emailVerification();

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert - should be EmailVerificationError, not InvalidCredentialsError
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
      });

      it("should map unknown Supabase auth error to AuthenticationError", () => {
        // Arrange
        const authError = createSupabaseAuthError.generic("Unknown error", 500);
        const expectedError = createAuthError.authentication(
          "An unknown authentication error occurred"
        );

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert - Should fall through to fallback since no matching pattern
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", authError);
      });

      it("should handle status 400 with non-matching message", () => {
        // Arrange - status 400 but message doesn't match any pattern
        const authError = createSupabaseAuthError.generic(
          "Some other error",
          400
        );
        const expectedError = createAuthError.authentication(
          "An unknown authentication error occurred"
        );

        // Act
        const result = mapSupabaseAuthError(authError);

        // Assert - Should fall through to fallback
        expect(result).toHaveProperty("code", expectedError.code);
        expect(result).toHaveProperty("debugMessage");
        expect(result).toHaveProperty("originalError", authError);
      });
    });
  });
});
