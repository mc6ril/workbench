import { z } from "zod";

import { updateUser } from "@/core/usecases/auth/updateUser";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthError } from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("updateUser", () => {
  it("should update user with email only", async () => {
    // Arrange
    const input = {
      email: "newemail@example.com",
    };
    const repository = createAuthRepositoryMock({
      updateUser: jest.fn<
        Promise<void>,
        [
          {
            email?: string;
            password?: string;
            data?: Record<string, unknown>;
          },
        ]
      >(async () => {
        // Success - no return value
      }),
    });

    // Act
    await updateUser(repository, input);

    // Assert
    expect(repository.updateUser).toHaveBeenCalledTimes(1);
    expect(repository.updateUser).toHaveBeenCalledWith({
      email: "newemail@example.com",
    });
  });

  it("should update user with password only", async () => {
    // Arrange
    const input = {
      password: "newpassword123",
    };
    const repository = createAuthRepositoryMock({
      updateUser: jest.fn<
        Promise<void>,
        [
          {
            email?: string;
            password?: string;
            data?: Record<string, unknown>;
          },
        ]
      >(async () => {
        // Success - no return value
      }),
    });

    // Act
    await updateUser(repository, input);

    // Assert
    expect(repository.updateUser).toHaveBeenCalledTimes(1);
    expect(repository.updateUser).toHaveBeenCalledWith({
      password: "newpassword123",
    });
  });

  it("should update user with data only", async () => {
    // Arrange
    const input = {
      data: { displayName: "John Doe" },
    };
    const repository = createAuthRepositoryMock({
      updateUser: jest.fn<
        Promise<void>,
        [
          {
            email?: string;
            password?: string;
            data?: Record<string, unknown>;
          },
        ]
      >(async () => {
        // Success - no return value
      }),
    });

    // Act
    await updateUser(repository, input);

    // Assert
    expect(repository.updateUser).toHaveBeenCalledTimes(1);
    expect(repository.updateUser).toHaveBeenCalledWith({
      data: { displayName: "John Doe" },
    });
  });

  it("should update user with multiple fields", async () => {
    // Arrange
    const input = {
      email: "newemail@example.com",
      password: "newpassword123",
      data: { displayName: "John Doe" },
    };
    const repository = createAuthRepositoryMock({
      updateUser: jest.fn<
        Promise<void>,
        [
          {
            email?: string;
            password?: string;
            data?: Record<string, unknown>;
          },
        ]
      >(async () => {
        // Success - no return value
      }),
    });

    // Act
    await updateUser(repository, input);

    // Assert
    expect(repository.updateUser).toHaveBeenCalledTimes(1);
    expect(repository.updateUser).toHaveBeenCalledWith({
      email: "newemail@example.com",
      password: "newpassword123",
      data: { displayName: "John Doe" },
    });
  });

  it("should throw error when all fields are missing", async () => {
    // Arrange
    const input = {};
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updateUser(repository, input)).rejects.toThrow(
      "At least one field (email, password, or data) must be provided"
    );
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid email format", async () => {
    // Arrange
    const invalidInput = {
      email: "invalid-email",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updateUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("should throw ZodError on password too short", async () => {
    // Arrange
    const invalidInput = {
      password: "12345", // Less than 6 characters
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updateUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("should throw ZodError on password too long", async () => {
    // Arrange
    const invalidInput = {
      password: "a".repeat(101), // More than 100 characters
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(updateUser(repository, invalidInput)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const input = {
      email: "newemail@example.com",
    };
    const repositoryError =
      createAuthError.authentication("Update user failed");
    const repository = createAuthRepositoryMock({
      updateUser: jest.fn<
        Promise<void>,
        [
          {
            email?: string;
            password?: string;
            data?: Record<string, unknown>;
          },
        ]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await updateUser(repository, input);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.updateUser).toHaveBeenCalledTimes(1);
  });
});
