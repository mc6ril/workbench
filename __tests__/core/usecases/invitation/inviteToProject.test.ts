import { createProjectInvitationGatewayMock } from "../../../../__mocks__/core/ports/projectInvitationGateway";

import {
  InvitationStatus,
  type ProjectInvitation,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";
import {
  inviteToProject,
  type InviteToProjectInput,
} from "@/domains/project/core/usecases/invitation/inviteToProject";

describe("inviteToProject", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockInvitation: ProjectInvitation = {
    id: "inv-001",
    projectId,
    role: ProjectRole.MEMBER,
    status: InvitationStatus.PENDING,
    token: "abc123",
    invitedBy: "user-001",
    expiresAt: new Date("2026-03-01"),
    createdAt: new Date("2026-02-22"),
    updatedAt: new Date("2026-02-22"),
  };

  it("should create invitation", async () => {
    const invitationRepo = createProjectInvitationGatewayMock({
      create: jest.fn<Promise<ProjectInvitation>, [InviteToProjectInput]>(
        async () => mockInvitation
      ),
    });

    const result = await inviteToProject(invitationRepo, {
      projectId,
      role: ProjectRole.MEMBER,
    });

    expect(result).toEqual(mockInvitation);
    expect(invitationRepo.create).toHaveBeenCalled();
  });

  it("should throw ZodError for invalid project id", async () => {
    const invitationRepo = createProjectInvitationGatewayMock();

    await expect(
      inviteToProject(invitationRepo, {
        projectId: "not-a-uuid",
        role: ProjectRole.MEMBER,
      })
    ).rejects.toThrow();
  });
});
