import type { ProjectWithRole } from "@/core/domain/project.schema";

import { listProjects } from "@/core/usecases/project/listProjects";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("listProjects", () => {
  const mockProjectWithRole1: ProjectWithRole = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Project 1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    role: "admin",
  };

  const mockProjectWithRole2: ProjectWithRole = {
    id: "456e7890-e89b-12d3-a456-426614174001",
    name: "Project 2",
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
    role: "member",
  };

  it("should list projects with user roles", async () => {
    // Arrange
    const projects: ProjectWithRole[] = [
      mockProjectWithRole1,
      mockProjectWithRole2,
    ];
    const repository = createProjectRepositoryMock({
      list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
    });

    // Act
    const result = await listProjects(repository);

    // Assert
    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(repository.list).toHaveBeenCalledWith();
    expect(result).toEqual(projects);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: mockProjectWithRole1.id,
      name: mockProjectWithRole1.name,
      role: "admin",
    });
    expect(result[1]).toMatchObject({
      id: mockProjectWithRole2.id,
      name: mockProjectWithRole2.name,
      role: "member",
    });
  });

  it("should return empty array when no projects", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => []),
    });

    // Act
    const result = await listProjects(repository);

    // Assert
    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(repository.list).toHaveBeenCalledWith();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createProjectRepositoryMock({
      list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(listProjects(repository)).rejects.toThrow(repositoryError);
    expect(repository.list).toHaveBeenCalledTimes(1);
  });

  it("should return projects with different roles", async () => {
    // Arrange
    const projects: ProjectWithRole[] = [
      { ...mockProjectWithRole1, role: "admin" },
      { ...mockProjectWithRole2, role: "member" },
      {
        id: "789e0123-e89b-12d3-a456-426614174002",
        name: "Project 3",
        createdAt: new Date("2024-01-03T00:00:00Z"),
        updatedAt: new Date("2024-01-03T00:00:00Z"),
        role: "viewer",
      },
    ];
    const repository = createProjectRepositoryMock({
      list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
    });

    // Act
    const result = await listProjects(repository);

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].role).toBe("admin");
    expect(result[1].role).toBe("member");
    expect(result[2].role).toBe("viewer");
  });
});
