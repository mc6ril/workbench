import {
  createConstraintError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";

import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

import {
  type Project,
  type ProjectWithRole,
} from "@/domains/project/core/domain/schema/project.schema";
import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { joinProject } from "@/domains/project/core/usecases/membership/joinProject";
import { getProject } from "@/domains/project/core/usecases/project/getProject";
import { listProjects } from "@/domains/workspace/core/usecases/project/listProjects";

describe("Project Flow Tests", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockProject: Project = {
    id: projectId,
    name: "Test Project",
    shortCode: "TP",
    boardEmoji: "📋",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockProjectWithRole: ProjectWithRole = {
    ...mockProject,
    role: ProjectRole.ADMIN,
  };

  describe("complete project access flow: listProjects → getProject → joinProject", () => {
    it("should complete project access flow successfully", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const catalogRepository = createProjectRepositoryMock({
        listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
          async () => projects
        ),
      });
      const projectRepository = createProjectRepositoryMock({
        findById: jest.fn<Promise<Project | null>, [string]>(
          async () => mockProject
        ),
      });
      const memberRepository = createMemberRepositoryMock({
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => mockProject),
      });

      // Act - Step 1: List projects
      const projectsResult = await listProjects(catalogRepository);

      // Assert - Step 1: Projects should be listed
      expect(catalogRepository.listAccessibleProjects).toHaveBeenCalledTimes(1);
      expect(catalogRepository.listAccessibleProjects).toHaveBeenCalledWith();
      expect(projectsResult).toEqual(projects);
      expect(projectsResult).toHaveLength(1);
      expect(projectsResult[0].id).toBe(projectId);

      // Act - Step 2: Get project by ID
      const projectResult = await getProject(projectRepository, projectId);

      // Assert - Step 2: Project should be retrieved
      expect(projectRepository.findById).toHaveBeenCalledTimes(1);
      expect(projectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(projectResult).toEqual(mockProject);
      expect(projectResult.id).toBe(projectId);
      expect(projectResult.name).toBe("Test Project");

      // Act - Step 3: Join project
      const addedProjectResult = await joinProject(
        memberRepository,
        projectId,
        ProjectRole.MEMBER
      );

      // Assert - Step 3: User should be added to project
      expect(memberRepository.addCurrentUserAsMember).toHaveBeenCalledTimes(1);
      expect(memberRepository.addCurrentUserAsMember).toHaveBeenCalledWith(
        projectId,
        ProjectRole.MEMBER
      );
      expect(addedProjectResult).toEqual(mockProject);
      expect(addedProjectResult.id).toBe(projectId);
    });

    it("should handle error when project not found in getProject step", async () => {
      // Arrange
      const projects: ProjectWithRole[] = [mockProjectWithRole];
      const notFoundProjectId = "999e9999-e89b-12d3-a456-426614174999";
      const catalogRepository = createProjectRepositoryMock({
        listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
          async () => projects
        ),
      });
      const projectRepository = createProjectRepositoryMock({
        findById: jest.fn<Promise<Project | null>, [string]>(async () => null),
      });
      const memberRepository = createMemberRepositoryMock({
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => mockProject),
      });

      // Act - Step 1: List projects (should succeed)
      const projectsResult = await listProjects(catalogRepository);
      expect(projectsResult).toHaveLength(1);

      // Act & Assert - Step 2: Get project (should throw NotFoundError)
      await expect(
        getProject(projectRepository, notFoundProjectId)
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        entityType: "Project",
        entityId: notFoundProjectId,
      });
      expect(projectRepository.findById).toHaveBeenCalledTimes(1);
      expect(projectRepository.findById).toHaveBeenCalledWith(notFoundProjectId);

      // Act - Step 3: Try to join a non-existent project (should throw)
      const notFoundError = createNotFoundError("Project", notFoundProjectId);
      memberRepository.addCurrentUserAsMember = jest.fn<
        Promise<Project>,
        [string, ("admin" | "member" | "viewer")?]
      >(async () => {
        throw notFoundError;
      });

      // Assert - Step 3: Should throw NotFoundError
      try {
        await joinProject(memberRepository, notFoundProjectId);
        fail("Expected joinProject to throw");
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
      const catalogRepository = createProjectRepositoryMock({
        listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
          async () => projects
        ),
      });
      const projectRepository = createProjectRepositoryMock({
        findById: jest.fn<Promise<Project | null>, [string]>(
          async () => mockProject
        ),
      });
      const memberRepository = createMemberRepositoryMock({
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
      await listProjects(catalogRepository);

      // Act - Step 2: Get project (should succeed)
      await getProject(projectRepository, projectId);

      // Act & Assert - Step 3: Join project (should fail with constraint error)
      try {
        await joinProject(memberRepository, projectId);
        fail("Expected joinProject to throw");
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
      const catalogRepository = createProjectRepositoryMock({
        listAccessibleProjects: jest.fn<Promise<ProjectWithRole[]>, []>(
          async () => {
          throw repositoryError;
          }
        ),
      });
      const projectRepository = createProjectRepositoryMock({
        findById: jest.fn<Promise<Project | null>, [string]>(
          async () => mockProject
        ),
      });
      const memberRepository = createMemberRepositoryMock({
        addCurrentUserAsMember: jest.fn<
          Promise<Project>,
          [string, ("admin" | "member" | "viewer")?]
        >(async () => mockProject),
      });

      // Act & Assert - Step 1: List projects (should fail)
      await expect(listProjects(catalogRepository)).rejects.toThrow(
        repositoryError
      );

      // Note: In a real flow, getProject and joinProject wouldn't be called if listProjects fails,
      // but we verify they were not called
      expect(projectRepository.findById).not.toHaveBeenCalled();
      expect(memberRepository.addCurrentUserAsMember).not.toHaveBeenCalled();
    });
  });
});
