 
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { updateMemberRole } from "@/domains/project/core/usecases/member/updateMemberRole";

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
