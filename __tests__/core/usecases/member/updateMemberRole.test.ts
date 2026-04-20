import { createProjectMemberGatewayMock } from "../../../../__mocks__/core/ports/projectMemberGateway";

import { ProjectRole } from "@/domains/project/core/domain/project.types";
import { updateMemberRole } from "@/domains/project/core/usecases/member/updateMemberRole";

describe("updateMemberRole", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";
  const memberId = "456e7890-e89b-12d3-a456-426614174001";

  it("should update role successfully", async () => {
    const repository = createProjectMemberGatewayMock({
      getCurrentRole: jest.fn().mockResolvedValue(ProjectRole.ADMIN),
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {}),
    });

    await updateMemberRole(repository, projectId, memberId, ProjectRole.VIEWER);

    expect(repository.updateRole).toHaveBeenCalledWith(
      memberId,
      ProjectRole.VIEWER
    );
  });

  it("should allow promoting to admin without checking count", async () => {
    const repository = createProjectMemberGatewayMock({
      getCurrentRole: jest.fn().mockResolvedValue(ProjectRole.ADMIN),
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {}),
    });

    await updateMemberRole(repository, projectId, memberId, ProjectRole.ADMIN);

    expect(repository.updateRole).toHaveBeenCalledWith(
      memberId,
      ProjectRole.ADMIN
    );
  });

  it("should reject role changes from non-admin members", async () => {
    const repository = createProjectMemberGatewayMock({
      getCurrentRole: jest.fn().mockResolvedValue(ProjectRole.MEMBER),
    });

    await expect(
      updateMemberRole(repository, projectId, memberId, ProjectRole.ADMIN)
    ).rejects.toMatchObject({
      code: "MEMBER_ROLE_CHANGE_ADMIN_REQUIRED",
    });

    expect(repository.updateRole).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database error");
    const repository = createProjectMemberGatewayMock({
      getCurrentRole: jest.fn().mockResolvedValue(ProjectRole.ADMIN),
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {
        throw error;
      }),
    });

    await expect(
      updateMemberRole(repository, projectId, memberId, ProjectRole.MEMBER)
    ).rejects.toThrow(error);
  });

  it("should throw ZodError for invalid memberId", async () => {
    const repository = createProjectMemberGatewayMock();

    await expect(
      updateMemberRole(repository, projectId, "not-a-uuid", ProjectRole.MEMBER)
    ).rejects.toThrow();
  });
});
