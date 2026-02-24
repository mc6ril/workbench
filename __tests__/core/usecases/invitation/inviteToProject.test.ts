import { DEFAULT_USER_PREFERENCES } from "@/core/domain/schema/auth.schema";
import {
  type CreateInvitationInput,
  InvitationStatus,
  type ProjectInvitation,
} from "@/core/domain/schema/invitation.schema";
import { getFeatureLimit } from "@/core/domain/schema/planFeatures.schema";
import { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { inviteToProject } from "@/core/usecases/invitation/inviteToProject";

jest.mock("@/core/domain/schema/planFeatures.schema", () => ({
  ...jest.requireActual("@/core/domain/schema/planFeatures.schema"),
  getFeatureLimit: jest.fn(
    jest.requireActual("@/core/domain/schema/planFeatures.schema")
      .getFeatureLimit
  ),
}));

const mockedGetFeatureLimit = getFeatureLimit as jest.MockedFunction<
  typeof getFeatureLimit
>;

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createInvitationRepositoryMock } from "../../../../__mocks__/core/ports/invitationRepository";
// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createMemberRepositoryMock } from "../../../../__mocks__/core/ports/memberRepository";

describe("inviteToProject", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  const mockInvitation: ProjectInvitation = {
    id: "inv-001",
    projectId,
    email: "new@example.com",
    role: ProjectRole.MEMBER,
    status: InvitationStatus.PENDING,
    token: "abc123",
    invitedBy: "user-001",
    expiresAt: new Date("2026-03-01"),
    createdAt: new Date("2026-02-22"),
    updatedAt: new Date("2026-02-22"),
  };

  const makeMember = (id: string): ProjectMember => ({
    id,
    projectId,
    userId: `user-${id}`,
    role: ProjectRole.MEMBER,
    profile: {
      id: `user-${id}`,
      email: `${id}@example.com`,
      displayName: `User ${id}`,
      avatarUrl: null,
      preferences: DEFAULT_USER_PREFERENCES,
      termsAcceptedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("should create invitation when under limit", async () => {
    const invitationRepo = createInvitationRepositoryMock({
      countPending: jest.fn<Promise<number>, [string]>(async () => 0),
      create: jest.fn<Promise<ProjectInvitation>, [CreateInvitationInput]>(
        async () => mockInvitation
      ),
    });
    const memberRepo = createMemberRepositoryMock({
      listByProject: jest.fn<Promise<ProjectMember[]>, [string]>(async () => [
        makeMember("1"),
      ]),
    });

    const result = await inviteToProject(
      invitationRepo,
      memberRepo,
      { projectId, email: "new@example.com", role: ProjectRole.MEMBER },
      SubscriptionPlan.FREE
    );

    expect(result).toEqual(mockInvitation);
    expect(invitationRepo.create).toHaveBeenCalled();
  });

  it("should throw when plan limit is reached", async () => {
    const invitationRepo = createInvitationRepositoryMock({
      countPending: jest.fn<Promise<number>, [string]>(async () => 1),
    });
    const memberRepo = createMemberRepositoryMock({
      listByProject: jest.fn<Promise<ProjectMember[]>, [string]>(async () => [
        makeMember("1"),
        makeMember("2"),
      ]),
    });

    await expect(
      inviteToProject(
        invitationRepo,
        memberRepo,
        { projectId, email: "new@example.com", role: ProjectRole.MEMBER },
        SubscriptionPlan.FREE
      )
    ).rejects.toThrow("workspace member limit reached");

    expect(invitationRepo.create).not.toHaveBeenCalled();
  });

  it("should allow invite when under higher plan limit", async () => {
    const invitationRepo = createInvitationRepositoryMock({
      countPending: jest.fn<Promise<number>, [string]>(async () => 0),
      create: jest.fn<Promise<ProjectInvitation>, [CreateInvitationInput]>(
        async () => mockInvitation
      ),
    });
    const memberRepo = createMemberRepositoryMock({
      listByProject: jest.fn<Promise<ProjectMember[]>, [string]>(async () => [
        makeMember("1"),
        makeMember("2"),
        makeMember("3"),
      ]),
    });

    const result = await inviteToProject(
      invitationRepo,
      memberRepo,
      { projectId, email: "new@example.com", role: ProjectRole.MEMBER },
      SubscriptionPlan.TEAM
    );

    expect(result).toEqual(mockInvitation);
    expect(invitationRepo.create).toHaveBeenCalled();
  });

  it("should skip limit check when plan has unlimited members", async () => {
    mockedGetFeatureLimit.mockReturnValueOnce(-1);

    const invitationRepo = createInvitationRepositoryMock({
      create: jest.fn<Promise<ProjectInvitation>, [CreateInvitationInput]>(
        async () => mockInvitation
      ),
    });
    const memberRepo = createMemberRepositoryMock();

    const result = await inviteToProject(
      invitationRepo,
      memberRepo,
      { projectId, email: "new@example.com", role: ProjectRole.MEMBER },
      SubscriptionPlan.TEAM
    );

    expect(result).toEqual(mockInvitation);
    expect(invitationRepo.create).toHaveBeenCalled();
    expect(memberRepo.listByProject).not.toHaveBeenCalled();
    expect(invitationRepo.countPending).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid email", async () => {
    const invitationRepo = createInvitationRepositoryMock();
    const memberRepo = createMemberRepositoryMock();

    await expect(
      inviteToProject(
        invitationRepo,
        memberRepo,
        { projectId, email: "not-an-email", role: ProjectRole.MEMBER },
        SubscriptionPlan.FREE
      )
    ).rejects.toThrow();
  });
});
