import { ProjectRole } from "@/core/domain/schema/project.schema";

import { updateMemberRole } from "@/core/usecases/member/updateMemberRole";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

describe("updateMemberRole", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";
  const memberId = "456e7890-e89b-12d3-a456-426614174001";

  it("should update role successfully", async () => {
    const repository = createMemberRepositoryMock({
      countAdmins: jest.fn<Promise<number>, [string]>(async () => 2),
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {}),
    });

    await updateMemberRole(repository, memberId, ProjectRole.VIEWER, projectId);

    expect(repository.updateRole).toHaveBeenCalledWith(
      memberId,
      ProjectRole.VIEWER
    );
  });

  it("should allow promoting to admin without checking count", async () => {
    const repository = createMemberRepositoryMock({
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {}),
    });

    await updateMemberRole(repository, memberId, ProjectRole.ADMIN, projectId);

    expect(repository.countAdmins).not.toHaveBeenCalled();
    expect(repository.updateRole).toHaveBeenCalledWith(
      memberId,
      ProjectRole.ADMIN
    );
  });

  it("should prevent demoting the last admin", async () => {
    const repository = createMemberRepositoryMock({
      countAdmins: jest.fn<Promise<number>, [string]>(async () => 1),
    });

    await expect(
      updateMemberRole(repository, memberId, ProjectRole.MEMBER, projectId)
    ).rejects.toThrow("Cannot demote the last admin");

    expect(repository.updateRole).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid memberId", async () => {
    const repository = createMemberRepositoryMock();

    await expect(
      updateMemberRole(repository, "not-a-uuid", ProjectRole.MEMBER, projectId)
    ).rejects.toThrow();
  });
});
