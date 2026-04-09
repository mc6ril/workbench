import { z } from "zod";

import {
  createAuthError,
  mockAuthResult,
  validSignUpInput,
} from "../../../../__mocks__/core/domain/authMocks";
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

import type {
  AuthResult,
  SignUpInput,
} from "@/domains/auth/core/domain/auth.types";
import { signUpUser } from "@/domains/auth/core/usecases/user/signUpUser";

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
      locale: "fr" as const,
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
      locale: "fr" as const,
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
      locale: "fr" as const,
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
      locale: "fr" as const,
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signUpUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signUp).not.toHaveBeenCalled();
  });

  it("should sign up user with displayName", async () => {
    // Arrange
    const inputWithDisplayName = {
      ...validInput,
      displayName: "Test User",
    };
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [SignUpInput]>(
        async () => mockAuthResult
      ),
    });

    // Act
    const result = await signUpUser(repository, inputWithDisplayName);

    // Assert
    expect(repository.signUp).toHaveBeenCalledTimes(1);
    expect(repository.signUp).toHaveBeenCalledWith(inputWithDisplayName);
    expect(result).toEqual(mockAuthResult);
  });

  it("should sign up user without displayName (optional)", async () => {
    // Arrange
    const inputWithoutDisplayName = {
      email: "test@example.com",
      password: "password123",
      locale: "fr" as const,
    };
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [SignUpInput]>(
        async () => mockAuthResult
      ),
    });

    // Act
    const result = await signUpUser(repository, inputWithoutDisplayName);

    // Assert
    expect(repository.signUp).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockAuthResult);
  });

  it("should pass termsAcceptedAt to repository when provided", async () => {
    // Arrange
    const termsTimestamp = "2026-02-20T10:00:00.000Z";
    const inputWithTerms = {
      ...validInput,
      termsAcceptedAt: termsTimestamp,
    };
    const repository = createAuthRepositoryMock({
      signUp: jest.fn<Promise<AuthResult>, [SignUpInput]>(
        async () => mockAuthResult
      ),
    });

    // Act
    const result = await signUpUser(repository, inputWithTerms);

    // Assert
    expect(repository.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ termsAcceptedAt: termsTimestamp })
    );
    expect(result).toEqual(mockAuthResult);
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
      });
      expect(error).toHaveProperty("debugMessage");
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
      });
      expect(error).toHaveProperty("debugMessage");
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
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.signUp).toHaveBeenCalledTimes(1);
  });
});
