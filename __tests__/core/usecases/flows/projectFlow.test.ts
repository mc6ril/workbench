import {
  createConstraintError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import type { Project } from "@/core/domain/schema/project.schema";
import type { ProjectWithRole } from "@/core/domain/schema/project.schema";

import { addUserToProject } from "@/core/usecases/project/addUserToProject";
import { getProject } from "@/core/usecases/project/getProject";
import { listProjects } from "@/core/usecases/project/listProjects";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("Project Flow Tests", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProject: Project = {
    id: projectId,
    name: "Test Project",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockProjectWithRole: ProjectWithRole = {
    ...mockProject,
    role: "admin",
  };

  describe("complete project access flow: listProjects → getProject → addUserToProject", () => {
    it("should complete project access flow successfully", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const repository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
        findById: jest.fn<Promise<Project | null>, [string]>(
          async () => mockProject
        ),
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => mockProject),
      });

      // Act - Step 1: List projects
      const projectsResult = await listProjects(repository);

      // Assert - Step 1: Projects should be listed
      expect(repository.list).toHaveBeenCalledTimes(1);
      expect(repository.list).toHaveBeenCalledWith();
      expect(projectsResult).toEqual(projects);
      expect(projectsResult).toHaveLength(1);
      expect(projectsResult[0].id).toBe(projectId);

      // Act - Step 2: Get project by ID
      const projectResult = await getProject(repository, projectId);

      // Assert - Step 2: Project should be retrieved
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).toHaveBeenCalledWith(projectId);
      expect(projectResult).toEqual(mockProject);
      expect(projectResult?.id).toBe(projectId);
      expect(projectResult?.name).toBe("Test Project");

      // Act - Step 3: Add user to project
      const addedProjectResult = await addUserToProject(
        repository,
        projectId,
        "member"
      );

      // Assert - Step 3: User should be added to project
      expect(repository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
      expect(repository.addCurrentUserAsMember).toHaveBeenCalledWith(
        projectId,
        "member"
      );
      expect(addedProjectResult).toEqual(mockProject);
      expect(addedProjectResult.id).toBe(projectId);
    });

    it("should handle error when project not found in getProject step", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const notFoundProjectId = "999e9999-e89b-12d3-a456-426614174999";
      const repository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
        findById: jest.fn<Promise<Project | null>, [string]>(async () => null),
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => mockProject),
      });

      // Act - Step 1: List projects (should succeed)
      const projectsResult = await listProjects(repository);
      expect(projectsResult).toHaveLength(1);

      // Act - Step 2: Get project (should return null)
      const projectResult = await getProject(repository, notFoundProjectId);
      expect(projectResult).toBeNull();

      // Act - Step 3: Try to add user to non-existent project (should throw)
      const notFoundError = createNotFoundError("Project", notFoundProjectId);
      repository.addCurrentUserAsMember = jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => {
        throw notFoundError;
      });

      // Assert - Step 3: Should throw NotFoundError
      try {
        await addUserToProject(repository, notFoundProjectId);
        fail("Expected addUserToProject to throw");
      } catch (error) {
        expect(error).toMatchObject({
          code: "NOT_FOUND",
          entityType: "Project",
          entityId: notFoundProjectId,
        });
      }
    });

    it("should handle constraint error when user already member", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const repository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => projects),
        findById: jest.fn<Promise<Project | null>, [string]>(
          async () => mockProject
        ),
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => {
          throw createConstraintError(
            "unique_project_member",
            "User is already a member of this project"
          );
        }),
      });

      // Act - Step 1: List projects (should succeed)
      await listProjects(repository);

      // Act - Step 2: Get project (should succeed)
      await getProject(repository, projectId);

      // Act & Assert - Step 3: Add user to project (should fail with constraint error)
      try {
        await addUserToProject(repository, projectId);
        fail("Expected addUserToProject to throw");
      } catch (error) {
        expect(error).toMatchObject({
          code: "CONSTRAINT_VIOLATION",
          constraint: "unique_project_member",
        });
      }
    });

    it("should handle error propagation through the flow", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      const repository = createProjectRepositoryMock({
        list: jest.fn<Promise<ProjectWithRole[]>, []>(async () => {
          throw repositoryError;
        }),
        findById: jest.fn<Promise<Project | null>, [string]>(
          async () => mockProject
        ),
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => mockProject),
      });

      // Act & Assert - Step 1: List projects (should fail)
      await expect(listProjects(repository)).rejects.toThrow(repositoryError);

      // Note: In a real flow, getProject and addUserToProject wouldn't be called if listProjects fails,
      // but we verify they were not called
      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.addCurrentUserAsMember).not.toHaveBeenCalled();
    });
  });
});
