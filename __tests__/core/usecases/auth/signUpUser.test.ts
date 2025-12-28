import { z } from "zod";

import type { AuthResult } from "@/core/domain/auth.schema";

import { signUpUser } from "@/core/usecases/auth/signUpUser";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  mockAuthResult,
  validSignUpInput,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("signUpUser", () => {
  const validInput = validSignUpInput;

  it("should sign up user with valid input", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [typeof validInput]>(
        async () => mockAuthResult
      ),
    });

    // Act
    const result = await signUpUser(repository, validInput);

    // Assert
    expect(repository.signUp).toHaveBeenCalledTimes(1);
    expect(repository.signUp).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockAuthResult);
  });

  it("should throw ZodError on invalid email format", async () => {
    // Arrange
    const invalidInput = {
      email: "invalid-email",
      password: "password123",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signUpUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signUp).not.toHaveBeenCalled();
  });

  it("should throw ZodError on password too short", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      password: "12345", // Less than 6 characters
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signUpUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signUp).not.toHaveBeenCalled();
  });

  it("should throw ZodError on password too long", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      password: "a".repeat(101), // More than 100 characters
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signUpUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signUp).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty email", async () => {
    // Arrange
    const invalidInput = {
      email: "",
      password: "password123",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signUpUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signUp).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = createAuthError.emailAlreadyExists();
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [typeof validInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await signUpUser(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "EMAIL_ALREADY_EXISTS",
        message: "Email already registered",
      });
    }
    expect(repository.signUp).toHaveBeenCalledTimes(1);
  });

  it("should propagate weak password error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.weakPassword();
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [typeof validInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await signUpUser(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "WEAK_PASSWORD",
        message: "Password is too weak",
      });
    }
    expect(repository.signUp).toHaveBeenCalledTimes(1);
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication();
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [typeof validInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await signUpUser(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed",
      });
    }
    expect(repository.signUp).toHaveBeenCalledTimes(1);
  });
});
