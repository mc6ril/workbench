import { z } from "zod";

import type { AuthResult } from "@/core/domain/auth.schema";

import { verifyEmail } from "@/core/usecases/auth/verifyEmail";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  mockAuthResult,
  validVerifyEmailInput,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("verifyEmail", () => {
  const validInput = validVerifyEmailInput;

  it("should verify email with valid token", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      verifyEmail: jest.fn<
        Promise<AuthResult>,
        [{ email?: string; token: string }]
      >(async () => mockAuthResult),
    });

    // Act
    const result = await verifyEmail(repository, validInput);

    // Assert
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
    expect(repository.verifyEmail).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockAuthResult);
  });

  it("should verify email with valid token and empty email", async () => {
    // Arrange
    const inputWithEmptyEmail = {
      email: "",
      token: "valid-verification-token",
    };
    const repository = createAuthRepositoryMock({
      verifyEmail: jest.fn<
        Promise<AuthResult>,
        [{ email?: string; token: string }]
      >(async () => mockAuthResult),
    });

    // Act
    const result = await verifyEmail(repository, inputWithEmptyEmail);

    // Assert
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
    expect(repository.verifyEmail).toHaveBeenCalledWith(inputWithEmptyEmail);
    expect(result).toEqual(mockAuthResult);
  });

  it("should verify email with valid token and no email", async () => {
    // Arrange
    const inputWithoutEmail = {
      token: "valid-verification-token",
    };
    const repository = createAuthRepositoryMock({
      verifyEmail: jest.fn<
        Promise<AuthResult>,
        [{ email?: string; token: string }]
      >(async () => mockAuthResult),
    });

    // Act
    const result = await verifyEmail(repository, inputWithoutEmail);

    // Assert
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
    expect(repository.verifyEmail).toHaveBeenCalledWith(inputWithoutEmail);
    expect(result).toEqual(mockAuthResult);
  });

  it("should throw ZodError on invalid email format", async () => {
    // Arrange
    const invalidInput = {
      email: "invalid-email",
      token: "valid-verification-token",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(verifyEmail(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.verifyEmail).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty token", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      token: "",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(verifyEmail(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.verifyEmail).not.toHaveBeenCalled();
  });

  it("should propagate invalid token error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.invalidToken();
    const repository = createAuthRepositoryMock({
      verifyEmail: jest.fn<
        Promise<AuthResult>,
        [{ email?: string; token: string }]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await verifyEmail(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "INVALID_TOKEN",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("should propagate email verification error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.emailVerification();
    const repository = createAuthRepositoryMock({
      verifyEmail: jest.fn<
        Promise<AuthResult>,
        [{ email?: string; token: string }]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await verifyEmail(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "EMAIL_VERIFICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication(
      "Verify email failed"
    );
    const repository = createAuthRepositoryMock({
      verifyEmail: jest.fn<
        Promise<AuthResult>,
        [{ email?: string; token: string }]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await verifyEmail(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
  });
});
