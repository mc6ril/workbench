import { z } from "zod";

import type { Project } from "@/core/domain/schema/project.schema";

import { createProject } from "@/core/usecases/project/createProject";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("createProject", () => {
  const mockProject: Project = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Project",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("should create project with valid input", async () => {
    // Arrange
    const input = { name: "Test Project" };
    const repository = createProjectRepositoryMock({
      create: jest.fn<Promise<Project>, [typeof input]>(
        async () => mockProject
      ),
    });

    // Act
    const result = await createProject(repository, input);

    // Assert
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockProject);
  });

  it("should throw error on invalid input (empty name)", async () => {
    // Arrange
    const input = { name: "" };
    const repository = createProjectRepositoryMock();

    // Act & Assert
    await expect(createProject(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const input = { name: "Test Project" };
    const repositoryError = new Error("Database error");
    const repository = createProjectRepositoryMock({
      create: jest.fn<Promise<Project>, [typeof input]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(createProject(repository, input)).rejects.toThrow(
      repositoryError
    );
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it("should return created project", async () => {
    // Arrange
    const input = { name: "My New Project" };
    const createdProject: Project = {
      id: "456e7890-e89b-12d3-a456-426614174001",
      name: "My New Project",
      createdAt: new Date("2024-01-02T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const repository = createProjectRepositoryMock({
      create: jest.fn<Promise<Project>, [typeof input]>(
        async () => createdProject
      ),
    });

    // Act
    const result = await createProject(repository, input);

    // Assert
    expect(result).toEqual(createdProject);
    expect(result.name).toBe("My New Project");
  });
});
