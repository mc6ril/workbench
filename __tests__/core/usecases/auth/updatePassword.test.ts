import { z } from "zod";

import {
  createAuthError,
  mockAuthResult,
  validUpdatePasswordInput,
} from "../../../../__mocks__/core/domain/authMocks";
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

import type {
  AuthResult,
  UpdatePasswordInput,
} from "@/domains/auth/core/domain/auth.types";
import { updatePassword } from "@/domains/auth/core/usecases/password/updatePassword";

describe("updatePassword", () => {
  const validInput = validUpdatePasswordInput;

  it("should update password with an active recovery session", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      updatePassword: jest.fn<Promise<AuthResult>, [UpdatePasswordInput]>(
        async () => mockAuthResult
      ),
    });

    // Act
    const result = await updatePassword(repository, validInput);

    // Assert
    expect(repository.updatePassword).toHaveBeenCalledTimes(1);
    expect(repository.updatePassword).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockAuthResult);
  });

  it("should throw ZodError on password too short", async () => {
    // Arrange
    const invalidInput = {
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
      updatePassword: jest.fn<Promise<AuthResult>, [UpdatePasswordInput]>(
        async () => {
          throw repositoryError;
        }
      ),
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
      updatePassword: jest.fn<Promise<AuthResult>, [UpdatePasswordInput]>(
        async () => {
          throw repositoryError;
        }
      ),
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
      updatePassword: jest.fn<Promise<AuthResult>, [UpdatePasswordInput]>(
        async () => {
          throw repositoryError;
        }
      ),
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
