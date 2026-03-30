import type {
  ProjectInvitation,
} from "@/domains/project/core/domain/project.types";
import type { AcceptedProjectInvitation } from "@/domains/project/core/ports/project-invitation.gateway";
import type { InviteToProjectInput } from "@/domains/project/core/usecases/invitation/inviteToProject";

/**
 * Mock type for ProjectInvitationGateway.
 */
export type ProjectInvitationGatewayMock = {
  listByProject: jest.Mock<Promise<ProjectInvitation[]>, [string]>;
  create: jest.Mock<Promise<ProjectInvitation>, [InviteToProjectInput]>;
  accept: jest.Mock<Promise<AcceptedProjectInvitation>, [string]>;
  decline: jest.Mock<Promise<void>, [string]>;
  revoke: jest.Mock<Promise<void>, [string]>;
  countPending: jest.Mock<Promise<number>, [string]>;
};

type ProjectInvitationGatewayMockOverrides =
  Partial<ProjectInvitationGatewayMock>;

/**
 * Factory for creating a mock ProjectInvitationGateway.
 */
export const createProjectInvitationGatewayMock = (
  overrides: ProjectInvitationGatewayMockOverrides = {}
): ProjectInvitationGatewayMock => {
  const base: ProjectInvitationGatewayMock = {
    listByProject: jest.fn<Promise<ProjectInvitation[]>, [string]>(),
    create: jest.fn<Promise<ProjectInvitation>, [InviteToProjectInput]>(),
    accept: jest.fn<Promise<AcceptedProjectInvitation>, [string]>(),
    decline: jest.fn<Promise<void>, [string]>(),
    revoke: jest.fn<Promise<void>, [string]>(),
    countPending: jest.fn<Promise<number>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
