import type {
  CreateInvitationInput,
  PendingInvitation,
  ProjectInvitation,
} from "@/core/domain/schema/invitation.schema";

/**
 * Mock type for InvitationRepository.
 */
export type InvitationRepositoryMock = {
  listByProject: jest.Mock<Promise<ProjectInvitation[]>, [string]>;
  create: jest.Mock<Promise<ProjectInvitation>, [CreateInvitationInput]>;
  accept: jest.Mock<
    Promise<{ projectId: string; projectName: string; role: string }>,
    [string]
  >;
  decline: jest.Mock<Promise<void>, [string]>;
  revoke: jest.Mock<Promise<void>, [string]>;
  listPendingForCurrentUser: jest.Mock<Promise<PendingInvitation[]>, []>;
  countPending: jest.Mock<Promise<number>, [string]>;
};

type InvitationRepositoryMockOverrides = Partial<InvitationRepositoryMock>;

/**
 * Factory for creating a mock InvitationRepository.
 */
export const createInvitationRepositoryMock = (
  overrides: InvitationRepositoryMockOverrides = {}
): InvitationRepositoryMock => {
  const base: InvitationRepositoryMock = {
    listByProject: jest.fn<Promise<ProjectInvitation[]>, [string]>(),
    create: jest.fn<Promise<ProjectInvitation>, [CreateInvitationInput]>(),
    accept: jest.fn<
      Promise<{ projectId: string; projectName: string; role: string }>,
      [string]
    >(),
    decline: jest.fn<Promise<void>, [string]>(),
    revoke: jest.fn<Promise<void>, [string]>(),
    listPendingForCurrentUser: jest.fn<Promise<PendingInvitation[]>, []>(),
    countPending: jest.fn<Promise<number>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
