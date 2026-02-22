import type { ReclaimableProject } from "@/core/domain/schema/project.schema";

import { listReclaimableProjects } from "@/core/usecases/project/listReclaimableProjects";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createProjectRepositoryMock } from "../../../../__mocks__/core/ports/projectRepository";

describe("listReclaimableProjects", () => {
  const mockReclaimableProject: ReclaimableProject = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Orphaned Project",
    shortCode: "OP",
    orphanedAt: new Date("2026-02-01T00:00:00Z"),
  };

  it("should return reclaimable projects", async () => {
    const projects: ReclaimableProject[] = [mockReclaimableProject];
    const repository = createProjectRepositoryMock({
      listReclaimableProjects: jest.fn<Promise<ReclaimableProject[]>, []>(
        async () => projects
      ),
    });

    const result = await listReclaimableProjects(repository);

    expect(repository.listReclaimableProjects).toHaveBeenCalledTimes(1);
    expect(result).toEqual(projects);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: mockReclaimableProject.id,
      name: mockReclaimableProject.name,
      shortCode: "OP",
    });
  });

  it("should return empty array when no reclaimable projects", async () => {
    const repository = createProjectRepositoryMock({
      listReclaimableProjects: jest.fn<Promise<ReclaimableProject[]>, []>(
        async () => []
      ),
    });

    const result = await listReclaimableProjects(repository);

    expect(repository.listReclaimableProjects).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it("should propagate repository errors", async () => {
    const repositoryError = new Error("Database connection failed");
    const repository = createProjectRepositoryMock({
      listReclaimableProjects: jest.fn<Promise<ReclaimableProject[]>, []>(
        async () => {
          throw repositoryError;
        }
      ),
    });

    await expect(listReclaimableProjects(repository)).rejects.toThrow(
      repositoryError
    );
    expect(repository.listReclaimableProjects).toHaveBeenCalledTimes(1);
  });

  it("should return multiple reclaimable projects", async () => {
    const projects: ReclaimableProject[] = [
      mockReclaimableProject,
      {
        id: "456e7890-e89b-12d3-a456-426614174001",
        name: "Another Orphaned Project",
        shortCode: "AO",
        orphanedAt: new Date("2026-02-10T00:00:00Z"),
      },
    ];
    const repository = createProjectRepositoryMock({
      listReclaimableProjects: jest.fn<Promise<ReclaimableProject[]>, []>(
        async () => projects
      ),
    });

    const result = await listReclaimableProjects(repository);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Orphaned Project");
    expect(result[1].name).toBe("Another Orphaned Project");
  });
});
