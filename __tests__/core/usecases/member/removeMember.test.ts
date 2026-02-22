import { removeMember } from "@/core/usecases/member/removeMember";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

describe("removeMember", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";
  const memberId = "456e7890-e89b-12d3-a456-426614174001";

  it("should remove a non-admin member", async () => {
    const repository = createMemberRepositoryMock({
      remove: jest.fn<Promise<void>, [string]>(async () => {}),
    });

    await removeMember(repository, memberId, projectId, "member");

    expect(repository.remove).toHaveBeenCalledWith(memberId);
    expect(repository.countAdmins).not.toHaveBeenCalled();
  });

  it("should remove an admin when other admins exist", async () => {
    const repository = createMemberRepositoryMock({
      countAdmins: jest.fn<Promise<number>, [string]>(async () => 2),
      remove: jest.fn<Promise<void>, [string]>(async () => {}),
    });

    await removeMember(repository, memberId, projectId, "admin");

    expect(repository.countAdmins).toHaveBeenCalledWith(projectId);
    expect(repository.remove).toHaveBeenCalledWith(memberId);
  });

  it("should prevent removing the last admin", async () => {
    const repository = createMemberRepositoryMock({
      countAdmins: jest.fn<Promise<number>, [string]>(async () => 1),
    });

    await expect(
      removeMember(repository, memberId, projectId, "admin")
    ).rejects.toThrow("Cannot remove the last admin");

    expect(repository.remove).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database error");
    const repository = createMemberRepositoryMock({
      remove: jest.fn<Promise<void>, [string]>(async () => {
        throw error;
      }),
    });

    await expect(
      removeMember(repository, memberId, projectId, "viewer")
    ).rejects.toThrow(error);
  });
});
