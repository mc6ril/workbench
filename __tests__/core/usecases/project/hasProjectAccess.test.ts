import { createProjectGatewayMock } from "../../../../__mocks__/core/ports/projectGateway";

import { hasProjectAccess } from "@/domains/workspace/core/usecases/project/hasProjectAccess";

describe("hasProjectAccess", () => {
  it("should return true when user has project access", async () => {
    // Arrange
    const repository = createProjectGatewayMock({
      hasAnyProjectAccess: jest.fn<Promise<boolean>, []>(async () => true),
    });

    // Act
    const result = await hasProjectAccess(repository);

    // Assert
    expect(repository.hasAnyProjectAccess).toHaveBeenCalledTimes(1);
    expect(repository.hasAnyProjectAccess).toHaveBeenCalledWith();
    expect(result).toBe(true);
  });

  it("should return false when user has no project access", async () => {
    // Arrange
    const repository = createProjectGatewayMock({
      hasAnyProjectAccess: jest.fn<Promise<boolean>, []>(async () => false),
    });

    // Act
    const result = await hasProjectAccess(repository);

    // Assert
    expect(repository.hasAnyProjectAccess).toHaveBeenCalledTimes(1);
    expect(repository.hasAnyProjectAccess).toHaveBeenCalledWith();
    expect(result).toBe(false);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database error");
    const repository = createProjectGatewayMock({
      hasAnyProjectAccess: jest.fn<Promise<boolean>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(hasProjectAccess(repository)).rejects.toThrow(repositoryError);
    expect(repository.hasAnyProjectAccess).toHaveBeenCalledTimes(1);
  });
});
