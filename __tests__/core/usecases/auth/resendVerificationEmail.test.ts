import { z } from "zod";

import { resendVerificationEmail } from "@/core/usecases/auth/resendVerificationEmail";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import {
  createAuthError,
  validEmail,
} from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("resendVerificationEmail", () => {
  it("should resend verification email successfully", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      resendVerificationEmail: jest.fn<Promise<void>, [string]>(async () => {
        // Success - no return value
      }),
    });

    // Act
    await resendVerificationEmail(repository, validEmail);

    // Assert
    expect(repository.resendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(repository.resendVerificationEmail).toHaveBeenCalledWith(validEmail);
  });

  it("should throw ZodError on invalid email format", async () => {
    // Arrange
    const invalidEmail = "invalid-email";
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(
      resendVerificationEmail(repository, invalidEmail)
    ).rejects.toThrow(z.ZodError);
    expect(repository.resendVerificationEmail).not.toHaveBeenCalled();
  });

  it("should throw ZodError on empty email", async () => {
    // Arrange
    const invalidEmail = "";
    const repository = createAuthRepositoryMock();

    // Act & Assert
    await expect(
      resendVerificationEmail(repository, invalidEmail)
    ).rejects.toThrow(z.ZodError);
    expect(repository.resendVerificationEmail).not.toHaveBeenCalled();
  });

  it("should propagate email verification error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.emailVerification(
      "Resend verification email failed"
    );
    const repository = createAuthRepositoryMock({
      resendVerificationEmail: jest.fn<Promise<void>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await resendVerificationEmail(repository, validEmail);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "EMAIL_VERIFICATION_ERROR",
        message: "Resend verification email failed",
      });
    }
    expect(repository.resendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication(
      "Resend verification email failed"
    );
    const repository = createAuthRepositoryMock({
      resendVerificationEmail: jest.fn<Promise<void>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await resendVerificationEmail(repository, validEmail);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
        message: "Resend verification email failed",
      });
    }
    expect(repository.resendVerificationEmail).toHaveBeenCalledTimes(1);
  });
});
