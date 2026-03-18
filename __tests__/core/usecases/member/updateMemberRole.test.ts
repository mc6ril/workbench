import { ProjectRole } from "@/domains/project-management/core/domain/schema/project.schema";

import { updateMemberRole } from "@/domains/project-management/core/usecases/member/updateMemberRole";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

describe("updateMemberRole", () => {
  const memberId = "456e7890-e89b-12d3-a456-426614174001";

  it("should update role successfully", async () => {
    const repository = createMemberRepositoryMock({
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {}),
    });

    await updateMemberRole(repository, memberId, ProjectRole.VIEWER);

    expect(repository.updateRole).toHaveBeenCalledWith(
      memberId,
      ProjectRole.VIEWER
    );
  });

  it("should allow promoting to admin without checking count", async () => {
    const repository = createMemberRepositoryMock({
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {}),
    });

    await updateMemberRole(repository, memberId, ProjectRole.ADMIN);

    expect(repository.updateRole).toHaveBeenCalledWith(
      memberId,
      ProjectRole.ADMIN
    );
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database error");
    const repository = createMemberRepositoryMock({
      updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(async () => {
        throw error;
      }),
    });

    await expect(
      updateMemberRole(repository, memberId, ProjectRole.MEMBER)
    ).rejects.toThrow(error);
  });

  it("should throw ZodError for invalid memberId", async () => {
    const repository = createMemberRepositoryMock();

    await expect(
      updateMemberRole(repository, "not-a-uuid", ProjectRole.MEMBER)
    ).rejects.toThrow();
  });
});
