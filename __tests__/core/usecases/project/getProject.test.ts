import { z } from "zod";

import type { Project } from "@/core/domain/schema/project.schema";

import { getProject } from "@/core/usecases/project/getProject";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("getProject", () => {
  const mockProject: Project = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Project",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  it("should get project by ID when exists", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      findById: jest.fn<Promise<Project | null>, [string]>(
        async () => mockProject
      ),
    });

    // Act
    const result = await getProject(repository, projectId);

    // Assert
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(result).toEqual(mockProject);
    expect(result.id).toBe(projectId);
    expect(result.name).toBe("Test Project");
  });

  it("should throw NotFoundError when project not found", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      findById: jest.fn<Promise<Project | null>, [string]>(async () => null),
    });

    // Act & Assert
    await expect(getProject(repository, projectId)).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Project",
      entityId: projectId,
    });
    expect(repository.findById).toHaveBeenCalledTimes(1);
    expect(repository.findById).toHaveBeenCalledWith(projectId);
  });

  it("should throw ZodError on invalid input (non-UUID)", async () => {
    // Arrange
    const invalidId = "invalid-uuid";
    const repository = createProjectRepositoryMock();

    // Act & Assert
    await expect(getProject(repository, invalidId)).rejects.toThrow(z.ZodError);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createProjectRepositoryMock({
      findById: jest.fn<Promise<Project | null>, [string]>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(getProject(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.findById).toHaveBeenCalledTimes(1);
  });

  it("should handle different project IDs", async () => {
    // Arrange
    const differentProjectId = "456e7890-e89b-12d3-a456-426614174001";
    const differentProject: Project = {
      id: differentProjectId,
      name: "Different Project",
      createdAt: new Date("2024-01-02T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const repository = createProjectRepositoryMock({
      findById: jest.fn<Promise<Project | null>, [string]>(
        async (id: string) => {
          if (id === differentProjectId) {
            return differentProject;
          }
          return null;
        }
      ),
    });

    // Act
    const result = await getProject(repository, differentProjectId);

    // Assert
    expect(repository.findById).toHaveBeenCalledWith(differentProjectId);
    expect(result).toEqual(differentProject);
    expect(result.id).toBe(differentProjectId);
  });
});
