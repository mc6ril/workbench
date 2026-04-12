import { createNotFoundError } from "@/shared/errors/repositoryError";

import { createProjectGatewayMock } from "../../../../__mocks__/core/ports/projectGateway";

import { deleteProject } from "@/domains/project/core/usecases/project/deleteProject";

describe("deleteProject", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  it("deletes an existing project", async () => {
    const repository = createProjectGatewayMock();
    repository.findById.mockResolvedValue({
      id: projectId,
      name: "Workspace",
      shortCode: "WS",
      boardEmoji: "📋",
      enabledModules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await deleteProject(repository, projectId);

    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(repository.delete).toHaveBeenCalledWith(projectId);
  });

  it("throws when the project does not exist", async () => {
    const repository = createProjectGatewayMock();
    repository.findById.mockResolvedValue(null);

    await expect(deleteProject(repository, projectId)).rejects.toEqual(
      createNotFoundError("Project", projectId)
    );

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
