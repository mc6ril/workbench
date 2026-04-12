import { z } from "zod";

import { createProjectGatewayMock } from "../../../../__mocks__/core/ports/projectGateway";

import type { Project } from "@/domains/project/core/domain/project.types";
import {
  createProject,
  type CreateProjectInput,
} from "@/domains/project/core/usecases/project/createProject";

describe("createProject", () => {
  const mockProject: Project = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Project",
    shortCode: "TP",
    boardEmoji: "📋",
    enabledModules: [],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("should create project with valid input", async () => {
    // Arrange
    const input = { name: "Test Project" };
    const repository = createProjectGatewayMock({
      create: jest.fn<Promise<Project>, [typeof input]>(
        async () => mockProject
      ),
    });

    // Act
    const result = await createProject(repository, input);

    // Assert
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test Project" })
    );
    expect(result).toEqual(mockProject);
  });

  it("should throw error on invalid input (empty name)", async () => {
    // Arrange
    const input = { name: "" };
    const repository = createProjectGatewayMock();

    // Act & Assert
    await expect(createProject(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should reject names that contain emoji", async () => {
    const input = { name: "Board 📋" };
    const repository = createProjectGatewayMock();

    await expect(createProject(repository, input)).rejects.toThrow(z.ZodError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("should pass boardEmoji to the gateway when provided", async () => {
    const input: CreateProjectInput = { name: "Rocket", boardEmoji: "🚀" };
    const repository = createProjectGatewayMock({
      create: jest.fn<Promise<Project>, [CreateProjectInput]>(
        async () => ({ ...mockProject, name: "Rocket", boardEmoji: "🚀" })
      ),
    });

    await createProject(repository, input);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Rocket", boardEmoji: "🚀" })
    );
  });

  it("should propagate repository errors", async () => {
    // Arrange
    const input = { name: "Test Project" };
    const repositoryError = new Error("Database error");
    const repository = createProjectGatewayMock({
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
      shortCode: "NP",
      boardEmoji: "📋",
      enabledModules: [],
      createdAt: new Date("2024-01-02T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };
    const repository = createProjectGatewayMock({
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
