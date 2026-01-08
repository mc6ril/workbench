import { z } from "zod";

import type { AuthResult } from "@/core/domain/schema/auth.schema";

import { updatePassword } from "@/core/usecases/auth/updatePassword";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  mockAuthResult,
  validUpdatePasswordInput,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("updatePassword", () => {
  const validInput = validUpdatePasswordInput;

  it("should update password with valid token", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      updatePassword: jest.fn<
        Promise<AuthResult>,
        [{ password: string; token: string; email?: string }]
      >(async () => mockAuthResult),
    });

    // Act
    const result = await updatePassword(repository, validInput);

    // Assert
    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
    expect(repository.updatePassword).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockAuthResult);
  });

  it("should update password with valid token and empty email", async () => {
    // Arrange
    const inputWithEmptyEmail = {
      email: "",
      token: "valid-reset-token",
      password: "newpassword123",
    };
    const repository = createAuthRepositoryMock({
      updatePassword: jest.fn<
        Promise<AuthResult>,
        [{ password: string; token: string; email?: string }]
      >(async () => mockAuthResult),
    });

    // Act
    const result = await updatePassword(repository, inputWithEmptyEmail);

    // Assert
    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
    expect(repository.updatePassword).toHaveBeenCalledWith(inputWithEmptyEmail);
    expect(result).toEqual(mockAuthResult);
  });

  it("should throw ZodError on invalid email format", async () => {
    // Arrange
    const invalidInput = {
      email: "invalid-email",
      token: "valid-reset-token",
      password: "newpassword123",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updatePassword(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty token", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      token: "",
      password: "newpassword123",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updatePassword(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("should throw ZodError on password too short", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      token: "valid-reset-token",
      password: "12345", // Less than 6 characters
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updatePassword(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("should throw ZodError on password too long", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      token: "valid-reset-token",
      password: "a".repeat(101), // More than 100 characters
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updatePassword(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("should propagate invalid token error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.invalidToken();
    const repository = createAuthRepositoryMock({
      updatePassword: jest.fn<
        Promise<AuthResult>,
        [{ password: string; token: string; email?: string }]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await updatePassword(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "INVALID_TOKEN",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
  });

  it("should propagate password reset error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.passwordReset();
    const repository = createAuthRepositoryMock({
      updatePassword: jest.fn<
        Promise<AuthResult>,
        [{ password: string; token: string; email?: string }]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await updatePassword(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "PASSWORD_RESET_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication(
      "Update password failed"
    );
    const repository = createAuthRepositoryMock({
      updatePassword: jest.fn<
        Promise<AuthResult>,
        [{ password: string; token: string; email?: string }]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await updatePassword(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
  });
});
