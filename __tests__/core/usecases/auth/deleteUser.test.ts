 
import { createAuthError } from "../../../../__mocks__/core/domain/authMocks";
import { createAuthRepositoryMock } from "../../../../__mocks__/core/ports/authRepository";

import { deleteAccount } from "@/domains/auth/core/usecases/user/deleteAccount";

describe("deleteAccount", () => {
  it("should delete user successfully", async () => {
    // Arrange
    const repository = createAuthRepositoryMock({
      deleteAccount: jest.fn<Promise<void>, []>(async () => {
        // Success - no return value
      }),
    });

    // Act
    await deleteAccount(repository);

    // Assert
    expect(repository.deleteAccount).toHaveBeenCalledTimes(1);
    expect(repository.deleteAccount).toHaveBeenCalledWith();
  });

  it("should propagate authentication error from repository", async () => {
    // Arrange
    const repositoryError =
      createAuthError.authentication("Delete user failed");
    const repository = createAuthRepositoryMock({
      deleteAccount: jest.fn<Promise<void>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    try {
      await deleteAccount(repository);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
      });
      expect(error).toHaveProperty("debugMessage");
    }
    expect(repository.deleteAccount).toHaveBeenCalledTimes(1);
  });
});
