import {
  createConstraintError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import { type Project,ProjectRole } from "@/core/domain/schema/project.schema";

import { addUserToProject } from "@/core/usecases/project/addUserToProject";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("addUserToProject", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProject: Project = {
    id: projectId,
    name: "Test Project",
    shortCode: "TP",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("should add user to project successfully with default role", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      addCurrentUserAsMember: jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => mockProject),
    });

    // Act
    const result = await addUserToProject(repository, projectId);

    // Assert
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledWith(
      projectId,
      ProjectRole.VIEWER
    );
    expect(result).toEqual(mockProject);
    expect(result.id).toBe(projectId);
  });

  it("should add user to project successfully with specified role", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      addCurrentUserAsMember: jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => mockProject),
    });

    // Act
    const result = await addUserToProject(
      repository,
      projectId,
      ProjectRole.MEMBER
    );

    // Assert
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledWith(
      projectId,
      ProjectRole.MEMBER
    );
    expect(result).toEqual(mockProject);
  });

  it("should add user to project successfully with admin role", async () => {
    // Arrange
    const repository = createProjectRepositoryMock({
      addCurrentUserAsMember: jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => mockProject),
    });

    // Act
    const result = await addUserToProject(
      repository,
      projectId,
      ProjectRole.ADMIN
    );

    // Assert
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledWith(
      projectId,
      ProjectRole.ADMIN
    );
    expect(result).toEqual(mockProject);
  });

  it("should throw NotFoundError when project not found", async () => {
    // Arrange
    const notFoundError = createNotFoundError("Project", projectId);
    const repository = createProjectRepositoryMock({
      addCurrentUserAsMember: jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => {
        throw notFoundError;
      }),
    });

    // Act & Assert
    try {
      await addUserToProject(repository, projectId);
      fail("Expected addUserToProject to throw");
    } catch (error) {
      expect(error).toMatchObject({
        code: "NOT_FOUND",
        entityType: "Project",
        entityId: projectId,
      });
    }
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
  });

  it("should throw ConstraintError when user already member", async () => {
    // Arrange
    const constraintError = createConstraintError(
      "unique_project_member",
      "User is already a member of this project"
    );
    const repository = createProjectRepositoryMock({
      addCurrentUserAsMember: jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => {
        throw constraintError;
      }),
    });

    // Act & Assert
    try {
      await addUserToProject(repository, projectId);
      fail("Expected addUserToProject to throw");
    } catch (error) {
      expect(error).toMatchObject({
        code: "CONSTRAINT_VIOLATION",
        constraint: "unique_project_member",
      });
    }
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed");
    const repository = createProjectRepositoryMock({
      addCurrentUserAsMember: jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => {
        throw repositoryError;
      }),
    });

    // Act & Assert
    await expect(addUserToProject(repository, projectId)).rejects.toThrow(
      repositoryError
    );
    expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
  });
});
