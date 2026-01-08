import { z } from "zod";

import type { AuthResult } from "@/core/domain/schema/auth.schema";

import { signInUser } from "@/core/usecases/auth/signInUser";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  mockAuthResult,
  validSignInInput,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("signInUser", () => {
  const validInput = validSignInInput;

  it("should sign in user with valid credentials", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      signIn: jest.fn<Promise<AuthResult>, [typeof validInput]>(
        async () => mockAuthResult
      ),
    });

    // Act
    const result = await signInUser(repository, validInput);

    // Assert
    expect(repository.signIn).toHaveBeenCalledTimes(1);
    expect(repository.signIn).toHaveBeenCalledWith(validInput);
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
    await expect(signInUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signIn).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty password", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      password: "",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signInUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signIn).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty email", async () => {
    // Arrange
    const invalidInput = {
      email: "",
      password: "password123",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(signInUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.signIn).not.toHaveBeenCalled();
  });

  it("should propagate invalid credentials error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.invalidCredentials();
    const repository = createAuthRepositoryMock({
      signIn: jest.fn<Promise<AuthResult>, [typeof validInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await signInUser(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "INVALID_CREDENTIALS",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.signIn).toHaveBeenCalledTimes(1);
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication();
    const repository = createAuthRepositoryMock({
      signIn: jest.fn<Promise<AuthResult>, [typeof validInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await signInUser(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.signIn).toHaveBeenCalledTimes(1);
  });
});
