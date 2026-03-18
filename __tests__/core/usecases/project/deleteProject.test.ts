import { createNotFoundError } from "@/domains/project-management/core/domain/repositoryError";

import { deleteProject } from "@/domains/project-management/core/usecases/project/deleteProject";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("deleteProject", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  it("deletes an existing project", async () => {
    const repository = createProjectRepositoryMock();
    repository.findById.mockResolvedValue({
      id: projectId,
      name: "Workspace",
      shortCode: "WS",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await deleteProject(repository, projectId);

    expect(repository.findById).toHaveBeenCalledWith(projectId);
    expect(repository.delete).toHaveBeenCalledWith(projectId);
  });

  it("throws when the project does not exist", async () => {
    const repository = createProjectRepositoryMock();
    repository.findById.mockResolvedValue(null);

    await expect(deleteProject(repository, projectId)).rejects.toEqual(
      createNotFoundError("Project", projectId)
    );

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
