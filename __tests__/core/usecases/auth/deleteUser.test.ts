import { deleteUser } from "@/core/usecases/auth/deleteUser";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthError } from "../../../../__mocks__/core/domain/authMocks";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

describe("deleteUser", () => {
  it("should delete user successfully", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      deleteUser: jest.fn<Promise<void>, []>(async () => {
        // Success - no return value
      }),
    });

    // Act
    await deleteUser(repository);

    // Assert
    expect(repository.deleteUser).toHaveBeenCalledTimes(1);
    expect(repository.deleteUser).toHaveBeenCalledWith();
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError =
      createAuthError.authentication("Delete user failed");
    const repository = createAuthRepositoryMock({
      deleteUser: jest.fn<Promise<void>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await deleteUser(repository);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
        message: "Delete user failed",
      });
    }
    expect(repository.deleteUser).toHaveBeenCalledTimes(1);
  });
});
