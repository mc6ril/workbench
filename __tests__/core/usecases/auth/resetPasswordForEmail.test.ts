import { z } from "zod";

import { resetPasswordForEmail } from "@/core/usecases/auth/resetPasswordForEmail";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  validResetPasswordInput,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("resetPasswordForEmail", () => {
  const validInput = validResetPasswordInput;

  it("should reset password for email successfully", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      resetPasswordForEmail: jest.fn<Promise<void>, [typeof validInput]>(
        async () => {
          // Success - no return value
        }
      ),
    });

    // Act
    await resetPasswordForEmail(repository, validInput);

    // Assert
    expect(repository.resetPasswordForEmail).toHaveBeenCalledTimes(1);
    expect(repository.resetPasswordForEmail).toHaveBeenCalledWith(validInput);
  });

  it("should throw ZodError on invalid email format", async () => {
    // Arrange
    const invalidInput = {
      email: "invalid-email",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(
      resetPasswordForEmail(repository, invalidInput)
    ).rejects.toThrow(z.ZodError);
    expect(repository.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty email", async () => {
    // Arrange
    const invalidInput = {
      email: "",
    };
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(
      resetPasswordForEmail(repository, invalidInput)
    ).rejects.toThrow(z.ZodError);
    expect(repository.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("should propagate password reset error from repository (email not found)", async () => {
    // Arrange
    const repositoryError = createAuthError.passwordReset("Email not found");
    const repository = createAuthRepositoryMock({
      resetPasswordForEmail: jest.fn<Promise<void>, [typeof validInput]>(
        async () => {
          throw repositoryError;
        }
      ),
    });

    // Act & Assert
    try {
      await resetPasswordForEmail(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "PASSWORD_RESET_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.resetPasswordForEmail).toHaveBeenCalledTimes(1);
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication(
      "Reset password failed"
    );
    const repository = createAuthRepositoryMock({
      resetPasswordForEmail: jest.fn<Promise<void>, [typeof validInput]>(
        async () => {
          throw repositoryError;
        }
      ),
    });

    // Act & Assert
    try {
      await resetPasswordForEmail(repository, validInput);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.resetPasswordForEmail).toHaveBeenCalledTimes(1);
  });
});
