import { hasProjectAccess } from "@/core/usecases/project/hasProjectAccess";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../__mocks__/core/ports/projectRepository";

describe("hasProjectAccess", () => {
  it("should return true when user has project access", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      hasProjectAccess: jest.fn<Promise<boolean>, []>(async () => true),
    });

    // Act
    const result = await hasProjectAccess(repository);

    // Assert
    expect(repository.hasProjectAccess).toHaveBeenCalledTimes(1);
    expect(repository.hasProjectAccess).toHaveBeenCalledWith();
    expect(result).toBe(true);
  });

  it("should return false when user has no project access", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      hasProjectAccess: jest.fn<Promise<boolean>, []>(async () => false),
    });

    // Act
    const result = await hasProjectAccess(repository);

    // Assert
    expect(repository.hasProjectAccess).toHaveBeenCalledTimes(1);
    expect(repository.hasProjectAccess).toHaveBeenCalledWith();
    expect(result).toBe(false);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createProjectRepositoryMock({
      hasProjectAccess: jest.fn<Promise<boolean>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(hasProjectAccess(repository)).rejects.toThrow(
      repositoryError
    );
    expect(repository.hasProjectAccess).toHaveBeenCalledTimes(1);
  });
});

