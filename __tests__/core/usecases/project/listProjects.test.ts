 
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

import {
  type ProjectWithRole,
} from "@/domains/project/core/domain/schema/project.schema";
import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { listProjects } from "@/domains/workspace/core/usecases/project/listProjects";

describe("listProjects", () => {
  const mockProjectWithRole1: ProjectWithRole = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Project 1",
    shortCode: "P1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    role: ProjectRole.ADMIN,
  };

  const mockProjectWithRole2: ProjectWithRole = {
    id: "456e7890-e89b-12d3-a456-426614174001",
    name: "Project 2",
    shortCode: "P2",
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
    role: ProjectRole.MEMBER,
  };

  it("should list projects with user roles", async () => {
    // Arrange
    const projects: ProjectWithRole[] = [
      mockProjectWithRole1,
      mockProjectWithRole2,
    ];
    const repository = createProjectRepositoryMock({
      listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
        async () => projects
      ),
    });

    // Act
    const result = await listProjects(repository);

    // Assert
    expect(repository.listAccessibleProjects).toHaveBeenCalledTimes(1);
    expect(repository.listAccessibleProjects).toHaveBeenCalledWith();
    expect(result).toEqual(projects);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: mockProjectWithRole1.id,
      name: mockProjectWithRole1.name,
      role: ProjectRole.ADMIN,
    });
    expect(result[1]).toMatchObject({
      id: mockProjectWithRole2.id,
      name: mockProjectWithRole2.name,
      role: ProjectRole.MEMBER,
    });
  });

  it("should return empty array when no projects", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
        async () => []
      ),
    });

    // Act
    const result = await listProjects(repository);

    // Assert
    expect(repository.listAccessibleProjects).toHaveBeenCalledTimes(1);
    expect(repository.listAccessibleProjects).toHaveBeenCalledWith();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createProjectRepositoryMock({
      listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
        async () => {
          throw repositoryError;
        }
      ),
    });

    // Act & Assert
    await expect(listProjects(repository)).rejects.toThrow(repositoryError);
    expect(repository.listAccessibleProjects).toHaveBeenCalledTimes(1);
  });

  it("should return projects with different roles", async () => {
    // Arrange
    const projects: ProjectWithRole[] = [
      { ...mockProjectWithRole1, role: ProjectRole.ADMIN },
      { ...mockProjectWithRole2, role: ProjectRole.MEMBER },
      {
        id: "789e0123-e89b-12d3-a456-426614174002",
        name: "Project 3",
        shortCode: "P3",
        createdAt: new Date("2024-01-03T00:00:00Z"),
        updatedAt: new Date("2024-01-03T00:00:00Z"),
        role: ProjectRole.VIEWER,
      },
    ];
    const repository = createProjectRepositoryMock({
      listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
        async () => projects
      ),
    });

    // Act
    const result = await listProjects(repository);

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].role).toBe(ProjectRole.ADMIN);
    expect(result[1].role).toBe(ProjectRole.MEMBER);
    expect(result[2].role).toBe(ProjectRole.VIEWER);
  });
});
