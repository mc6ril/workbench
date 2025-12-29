import { signOutUser } from "@/core/usecases/auth/signOutUser";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthError } from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("signOutUser", () => {
  it("should sign out user successfully", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      signOut: jest.fn<Promise<void>, []>(async () => {
        // Success - no return value
      }),
    });

    // Act
    await signOutUser(repository);

    // Assert
    expect(repository.signOut).toHaveBeenCalledTimes(1);
    expect(repository.signOut).toHaveBeenCalledWith();
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError = createAuthError.authentication("Sign out failed");
    const repository = createAuthRepositoryMock({
      signOut: jest.fn<Promise<void>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await signOutUser(repository);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.signOut).toHaveBeenCalledTimes(1);
  });
});
