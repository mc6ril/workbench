import { z } from "zod";

import type {
  Epic,
  UpdateEpicInput,
} from "@/core/domain/schema/epic.schema";

import { updateEpic } from "@/core/usecases/epic/updateEpic";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createEpicRepositoryMock } from "../../../../__mocks__/core/ports/epicRepository";

describe("updateEpic", () => {
  const epicId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  const mockEpic: Epic = {
    id: epicId,
    projectId,
    name: "Test Epic",
    description: "Test description",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const updatedEpic: Epic = {
    ...mockEpic,
    name: "Updated Epic",
    description: "Updated description",
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("should update epic with valid input", async () => {
    // Arrange
    const input: UpdateEpicInput = {
      name: "Updated Epic",
      description: "Updated description",
    };
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      update: jest.fn<Promise<Epic>, [string, UpdateEpicInput]>(
        async () => updatedEpic
      ),
    });

    // Act
    const result = await updateEpic(repository, epicId, input);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(epicId);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(epicId, input);
    expect(result).toEqual(updatedEpic);
  });

  it("should update epic with partial input (name only)", async () => {
    // Arrange
    const input: UpdateEpicInput = {
      name: "Updated Epic",
    };
    const updatedEpicPartial = {
      ...mockEpic,
      name: "Updated Epic",
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      update: jest.fn<Promise<Epic>, [string, UpdateEpicInput]>(
        async () => updatedEpicPartial
      ),
    });

    // Act
    const result = await updateEpic(repository, epicId, input);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(epicId, input);
    expect(result).toEqual(updatedEpicPartial);
    expect(result.name).toBe("Updated Epic");
  });

  it("should update epic with null description", async () => {
    // Arrange
    const input: UpdateEpicInput = {
      description: null,
    };
    const updatedEpicNullDesc = {
      ...mockEpic,
      description: null,
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      update: jest.fn<Promise<Epic>, [string, UpdateEpicInput]>(
        async () => updatedEpicNullDesc
      ),
    });

    // Act
    const result = await updateEpic(repository, epicId, input);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(epicId, input);
    expect(result).toEqual(updatedEpicNullDesc);
    expect(result.description).toBeNull();
  });

  it("should throw NotFoundError when epic not found", async () => {
    // Arrange
    const input = {
      name: "Updated Epic",
    };
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => null),
    });

    // Act & Assert
    await expect(updateEpic(repository, epicId, input)).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Epic",
      entityId: epicId,
    });
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid input (empty name)", async () => {
    // Arrange
    const input = {
      name: "",
    };
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
    });

    // Act & Assert
    await expect(updateEpic(repository, epicId, input)).rejects.toThrow(
      z.ZodError
    );
    expect(repository.findById).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from findById", async () => {
    // Arrange
    const input = {
      name: "Updated Epic",
    };
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(updateEpic(repository, epicId, input)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from update", async () => {
    // Arrange
    const input: UpdateEpicInput = {
      name: "Updated Epic",
    };
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      findById: jest.fn<Promise<Epic | null>, [string]>(
        async () => mockEpic
      ),
      update: jest.fn<Promise<Epic>, [string, UpdateEpicInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(updateEpic(repository, epicId, input)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });
});
