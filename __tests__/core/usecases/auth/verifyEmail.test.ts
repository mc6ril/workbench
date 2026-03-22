import { z } from "zod";

import {
  createAuthError,
  mockAuthResult,
  validVerifyEmailInput,
} from "../../../../__mocks__/core/domain/authMocks";
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

import { verifyEmail } from "@/domains/auth/core/usecases/verifyEmail";

describe("verifyEmail", () => {
  const validInput = validVerifyEmailInput;

  it("should verify email with valid token", async () => {
    // Arrange
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockResolvedValue(mockAuthResult);

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
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockResolvedValue(mockAuthResult);

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
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockResolvedValue(mockAuthResult);

    // Act
    const result = await verifyEmail(repository, inputWithoutEmail);

    // Assert
    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
    expect(repository.verifyEmail).toHaveBeenCalledWith(inputWithoutEmail);
    expect(result).toEqual(mockAuthResult);
  });

  it("should verify email with a PKCE code", async () => {
    const inputWithCode = {
      code: "pkce-code",
    };
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockResolvedValue(mockAuthResult);

    const result = await verifyEmail(repository, inputWithCode);

    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
    expect(repository.verifyEmail).toHaveBeenCalledWith(inputWithCode);
    expect(result).toEqual(mockAuthResult);
  });

  it("should verify email with a token hash", async () => {
    const inputWithTokenHash = {
      tokenHash: "token-hash",
      type: "signup" as const,
    };
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockResolvedValue(mockAuthResult);

    const result = await verifyEmail(repository, inputWithTokenHash);

    expect(repository.verifyEmail).toHaveBeenCalledTimes(1);
    expect(repository.verifyEmail).toHaveBeenCalledWith(inputWithTokenHash);
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

  it("should throw ZodError when no verification payload is provided", async () => {
    const repository = createAuthRepositoryMock();

    await expect(verifyEmail(repository, {})).rejects.toThrow(z.ZodError);
    expect(repository.verifyEmail).not.toHaveBeenCalled();
  });

  it("should propagate invalid token error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.invalidToken();
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockImplementation(async () => {
      throw repositoryError;
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
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockImplementation(async () => {
      throw repositoryError;
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
    const repository = createAuthRepositoryMock();
    repository.verifyEmail.mockImplementation(async () => {
      throw repositoryError;
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
