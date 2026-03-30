import { z } from "zod";

import { createProjectGatewayMock } from "../../../../__mocks__/core/ports/projectGateway";

import type { Project } from "@/domains/project/core/domain/project.types";
import {
  updateProject,
  type UpdateProjectInput,
} from "@/domains/project/core/usecases/project/updateProject";

describe("updateProject", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const updatedProject: Project = {
    id: projectId,
    name: "Updated Project",
    shortCode: "UP",
    boardEmoji: "📋",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  it("updates a project with valid input", async () => {
    const repository = createProjectGatewayMock({
      update: jest.fn<Promise<Project>, [string, UpdateProjectInput]>(
        async () => updatedProject
      ),
    });

    const result = await updateProject(repository, projectId, {
      name: "Updated Project",
    });

    expect(repository.update).toHaveBeenCalledWith(projectId, {
      name: "Updated Project",
    });
    expect(result).toEqual(updatedProject);
  });

  it("trims the project name before updating", async () => {
    const repository = createProjectGatewayMock({
      update: jest.fn<Promise<Project>, [string, UpdateProjectInput]>(
        async () => updatedProject
      ),
    });

    await updateProject(repository, projectId, {
      name: "  Updated Project  ",
    });

    expect(repository.update).toHaveBeenCalledWith(projectId, {
      name: "Updated Project",
    });
  });

  it("throws on invalid project id", async () => {
    const repository = createProjectGatewayMock();

    await expect(
      updateProject(repository, "invalid-id", { name: "Updated Project" })
    ).rejects.toThrow(z.ZodError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("throws on empty project name", async () => {
    const repository = createProjectGatewayMock();

    await expect(
      updateProject(repository, projectId, { name: "   " })
    ).rejects.toThrow(z.ZodError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("updates board emoji only", async () => {
    const repository = createProjectGatewayMock({
      update: jest.fn<Promise<Project>, [string, UpdateProjectInput]>(
        async () => ({
          ...updatedProject,
          boardEmoji: "🚀",
        })
      ),
    });

    const result = await updateProject(repository, projectId, {
      boardEmoji: "🚀",
    });

    expect(repository.update).toHaveBeenCalledWith(projectId, {
      boardEmoji: "🚀",
    });
    expect(result.boardEmoji).toBe("🚀");
  });

  it("rejects names that contain emoji", async () => {
    const repository = createProjectGatewayMock();

    await expect(
      updateProject(repository, projectId, { name: "Bad 📋" })
    ).rejects.toThrow(z.ZodError);

    expect(repository.update).not.toHaveBeenCalled();
  });
});
