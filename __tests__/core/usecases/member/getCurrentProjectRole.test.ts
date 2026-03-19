import { getCurrentProjectRole } from "@/domains/project-management/core/usecases/member/getCurrentProjectRole";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

describe("getCurrentProjectRole", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  it("returns current role", async () => {
    const repository = createMemberRepositoryMock({
      getCurrentRole: jest.fn<Promise<ProjectRole | null>, [string]>(
        async () => ProjectRole.MEMBER
      ),
    });

    await expect(getCurrentProjectRole(repository, projectId)).resolves.toBe(
      ProjectRole.MEMBER
    );
    expect(repository.getCurrentRole).toHaveBeenCalledWith(projectId);
  });

  it("returns null when user is not member", async () => {
    const repository = createMemberRepositoryMock({
      getCurrentRole: jest.fn<Promise<ProjectRole | null>, [string]>(
        async () => null
      ),
    });

    await expect(getCurrentProjectRole(repository, projectId)).resolves.toBe(
      null
    );
  });

  it("throws on invalid project id", async () => {
    const repository = createMemberRepositoryMock();

    await expect(
      getCurrentProjectRole(repository, "invalid-project-id")
    ).rejects.toThrow();
    expect(repository.getCurrentRole).not.toHaveBeenCalled();
  });
});
