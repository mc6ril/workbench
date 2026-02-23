import { z } from "zod";

import type { CreateEpicInput, Epic } from "@/core/domain/schema/epic.schema";

import { createEpic } from "@/core/usecases/epic/createEpic";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createEpicRepositoryMock } from "../../../../__mocks__/core/ports/epicRepository";

describe("createEpic", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockEpic: Epic = {
    id: "223e4567-e89b-12d3-a456-426614174000",
    projectId,
    name: "Test Epic",
    description: "Test description",
    codeNumber: 1,
    startDate: null,
    targetDate: null,
    color: "#6B7280",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("should create epic with valid input", async () => {
    // Arrange
    const input: CreateEpicInput = {
      projectId,
      name: "Test Epic",
      description: "Test description",
    };
    const repository = createEpicRepositoryMock({
      getNextCodeNumberForProject: jest
        .fn<Promise<number>, [string]>()
        .mockResolvedValue(1),
      create: jest.fn<Promise<Epic>, [CreateEpicInput]>(async () => mockEpic),
    });

    // Act
    const result = await createEpic(repository, input);

    // Assert
    expect(repository.create).toHaveBeenCalledTimes(1);
    const createArg = (repository.create.mock.calls[0] ?? [])[0];
    expect(createArg).toMatchObject({
      ...input,
      codeNumber: expect.any(Number),
    });
    expect(result).toEqual(mockEpic);
  });

  it("should create epic with minimal input (no description)", async () => {
    // Arrange
    const input: CreateEpicInput = {
      projectId,
      name: "Test Epic",
    };
    const createdEpic = {
      ...mockEpic,
      description: null,
    };
    const repository = createEpicRepositoryMock({
      getNextCodeNumberForProject: jest
        .fn<Promise<number>, [string]>()
        .mockResolvedValue(1),
      create: jest.fn<Promise<Epic>, [CreateEpicInput]>(
        async () => createdEpic
      ),
    });

    // Act
    const result = await createEpic(repository, input);

    // Assert
    expect(repository.create).toHaveBeenCalledTimes(1);
    const createArg = (repository.create.mock.calls[0] ?? [])[0];
    expect(createArg).toMatchObject({
      ...input,
      codeNumber: expect.any(Number),
    });
    expect(result).toEqual(createdEpic);
    expect(result.description).toBeNull();
  });

  it("should throw ZodError on invalid input (empty name)", async () => {
    // Arrange
    const input = {
      projectId,
      name: "",
    };
    const repository = createEpicRepositoryMock();

    // Act & Assert
    await expect(createEpic(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid input (invalid projectId)", async () => {
    // Arrange
    const input = {
      projectId: "invalid-uuid",
      name: "Test Epic",
    };
    const repository = createEpicRepositoryMock();

    // Act & Assert
    await expect(createEpic(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should throw ZodError on invalid input (missing name)", async () => {
    // Arrange
    const input = {
      projectId,
    } as unknown as CreateEpicInput;
    const repository = createEpicRepositoryMock();

    // Act & Assert
    await expect(createEpic(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const input: CreateEpicInput = {
      projectId,
      name: "Test Epic",
    };
    const repositoryError = new Error("Database error");
    const repository = createEpicRepositoryMock({
      getNextCodeNumberForProject: jest
        .fn<Promise<number>, [string]>()
        .mockResolvedValue(1),
      create: jest.fn<Promise<Epic>, [CreateEpicInput]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(createEpic(repository, input)).rejects.toThrow(
      repositoryError
    );
    expect(repository.create).toHaveBeenCalledTimes(1);
  });
});
