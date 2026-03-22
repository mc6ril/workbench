 
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

import { removeMember } from "@/domains/project/core/usecases/member/removeMember";

describe("removeMember", () => {
  const memberId = "456e7890-e89b-12d3-a456-426614174001";

  it("should remove a member", async () => {
    const repository = createMemberRepositoryMock({
      remove: jest.fn<Promise<void>, [string]>(async () => {}),
    });

    await removeMember(repository, memberId);

    expect(repository.remove).toHaveBeenCalledWith(memberId);
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database error");
    const repository = createMemberRepositoryMock({
      remove: jest.fn<Promise<void>, [string]>(async () => {
        throw error;
      }),
    });

    await expect(removeMember(repository, memberId)).rejects.toThrow(error);
  });

  it("should throw ZodError for invalid memberId", async () => {
    const repository = createMemberRepositoryMock();

    await expect(removeMember(repository, "not-a-uuid")).rejects.toThrow();
  });
});
